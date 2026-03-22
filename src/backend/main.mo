import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  public type ListingCategory = {
    #phones;
    #macbooks;
    #watches;
    #earphones;
  };

  public type ListingCondition = {
    #new;
    #likeNew;
    #good;
    #fair;
  };

  public type Listing = {
    id : Text;
    title : Text;
    description : Text;
    price : Nat;
    location : Text;
    category : ListingCategory;
    condition : ListingCondition;
    images : [Storage.ExternalBlob];
    timestamp : Time.Time;
    seller : Principal;
  };

  module Listing {
    public func compare(listing1 : Listing, listing2 : Listing) : Order.Order {
      Text.compare(listing1.title, listing2.title);
    };
    public func compareByPrice(listing1 : Listing, listing2 : Listing) : Order.Order {
      Int.compare(listing1.price, listing2.price);
    };
  };

  public type Message = {
    id : Text;
    listingId : Text;
    sender : Principal;
    recipient : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  module Message {
    public func compare(message1 : Message, message2 : Message) : Order.Order {
      Text.compare(message1.content, message2.content);
    };
    public func compareByTimestamp(message1 : Message, message2 : Message) : Order.Order {
      Int.compare(message1.timestamp, message2.timestamp);
    };
  };

  public type PickupBookingStatus = {
    #pending;
    #confirmed;
    #completed;
    #cancelled;
  };

  public type PickupBooking = {
    id : Text;
    sellerName : Text;
    phone : Text;
    address : Text;
    date : Text;
    timeSlot : Text;
    deviceModel : Text;
    quotedPrice : Nat;
    status : PickupBookingStatus;
    timestamp : Time.Time;
  };

  module PickupBooking {
    public func compareByTimestamp(booking1 : PickupBooking, booking2 : PickupBooking) : Order.Order {
      Int.compare(booking2.timestamp, booking1.timestamp);
    };
    public func compareByPrice(booking1 : PickupBooking, booking2 : PickupBooking) : Order.Order {
      Int.compare(booking1.quotedPrice, booking2.quotedPrice);
    };
  };

  func generateId(prefix : Text, counter : Nat) : Text {
    prefix # "_" # counter.toText();
  };

  public type UserProfile = {
    name : Text;
    phone : Text;
    isVerified : Bool;
    aadhaarHash : Text;
  };

  module UserProfile {
    public func compare(user1 : UserProfile, user2 : UserProfile) : Order.Order {
      Text.compare(user1.name, user2.name);
    };
  };

  var nextListingId = 1;
  var nextMessageId = 1;
  var nextBookingId = 1;
  let listings = Map.empty<Text, Listing>();
  let messages = Map.empty<Text, Message>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let pickupBookings = Map.empty<Text, PickupBooking>();

  public shared ({ caller }) func createListing(listing : Listing) : async Text {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please login to post an ad");
    };
    nextListingId += 1;
    let id = generateId("listing", nextListingId);
    let newListing : Listing = {
      listing with
      id;
      seller = caller;
      images = listing.images;
      timestamp = Time.now();
    };
    listings.add(id, newListing);
    id;
  };

  public query func searchListings(searchText : Text) : async [Listing] {
    listings.values().toArray().filter(
      func(listing) {
        listing.title.contains(#text searchText) or listing.description.contains(#text searchText);
      }
    ).sort();
  };

  public query func filterByCategory(category : ListingCategory) : async [Listing] {
    listings.values().toArray().filter(
      func(listing) {
        listing.category == category;
      }
    ).sort();
  };

  public query func filterByCondition(condition : ListingCondition) : async [Listing] {
    listings.values().toArray().filter(
      func(listing) {
        listing.condition == condition;
      }
    ).sort();
  };

  public query func filterByPriceRange(minPrice : Nat, maxPrice : Nat) : async [Listing] {
    listings.values().toArray().filter(
      func(listing) {
        listing.price >= minPrice and listing.price <= maxPrice;
      }
    ).sort(Listing.compareByPrice);
  };

  public query func getListingById(listingId : Text) : async ?Listing {
    listings.get(listingId);
  };

  public query func getAllListings() : async [Listing] {
    listings.values().toArray().sort();
  };

  public query func getAllListingsByPrice() : async [Listing] {
    listings.values().toArray().sort(Listing.compareByPrice);
  };

  public shared ({ caller }) func deleteListing(listingId : Text) : async () {
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        if (listing.seller != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized");
        };
        listings.remove(listingId);
      };
    };
  };

  public shared ({ caller }) func postMessage(
    listingId : Text,
    recipient : Principal,
    content : Text,
  ) : async Text {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please login to send messages");
    };
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (_) {
        nextMessageId += 1;
        let messageId = generateId("msg", nextMessageId);
        let newMessage : Message = {
          id = messageId;
          listingId;
          sender = caller;
          recipient;
          content;
          timestamp = Time.now();
        };
        messages.add(messageId, newMessage);
        messageId;
      };
    };
  };

  public query ({ caller }) func getMessagesForListing(listingId : Text) : async [Message] {
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        if (caller != listing.seller and not AccessControl.isAdmin(accessControlState, caller)) {
          let callerMessages = messages.values().toArray().filter(
            func(message) {
              message.listingId == listingId and (message.sender == caller or message.recipient == caller);
            }
          );
          if (callerMessages.size() == 0) {
            Runtime.trap("Unauthorized: Only the seller or involved buyers can view messages for this listing");
          };
        };
        messages.values().toArray().filter(
          func(message) { message.listingId == listingId }
        ).sort(Message.compareByTimestamp);
      };
    };
  };

  public query ({ caller }) func getCallerMessagesWithUser(user : Principal) : async [Message] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };
    messages.values().toArray().filter(
      func(message) {
        (message.sender == user and message.recipient == caller) or
        (message.sender == caller and message.recipient == user);
      }
    ).sort(Message.compareByTimestamp);
  };

  public query ({ caller }) func getCallerRelatedListings() : async [Listing] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Only users can view their listings");
    };
    listings.values().toArray().filter(func(listing) { listing.seller == caller }).sort();
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    userProfiles.get(caller);
  };

  public query func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public query func getAllUserProfiles() : async [UserProfile] {
    userProfiles.values().toArray().sort();
  };

  public query func getAllMessages() : async [Message] {
    messages.values().toArray().sort(Message.compareByTimestamp);
  };

  public shared func submitPickupBooking(booking : PickupBooking) : async Text {
    nextBookingId += 1;
    let id = generateId("booking", nextBookingId);
    let newBooking : PickupBooking = {
      booking with
      id;
      deviceModel = booking.deviceModel;
      quotedPrice = booking.quotedPrice;
      status = #pending;
      timestamp = Time.now();
    };
    pickupBookings.add(id, newBooking);
    id;
  };

  public query ({ caller }) func getAllPickupBookings() : async [PickupBooking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all pickup bookings");
    };
    pickupBookings.values().toArray().sort(PickupBooking.compareByTimestamp);
  };

  public shared ({ caller }) func updateBookingStatus(bookingId : Text, newStatus : PickupBookingStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update booking status");
    };
    switch (pickupBookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        let updatedBooking : PickupBooking = {
          booking with
          status = newStatus;
        };
        pickupBookings.add(bookingId, updatedBooking);
      };
    };
  };

  public query ({ caller }) func getPickupBooking(bookingId : Text) : async ?PickupBooking {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view pickup booking details");
    };
    pickupBookings.get(bookingId);
  };

  public query ({ caller }) func getPickupsByDate(date : Text) : async [PickupBooking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can filter pickup bookings");
    };
    pickupBookings.values().toArray().filter(
      func(booking) { booking.date == date }
    ).sort(PickupBooking.compareByTimestamp);
  };

  public query ({ caller }) func getPickupsByTimeSlot(timeSlot : Text) : async [PickupBooking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can filter pickup bookings");
    };
    pickupBookings.values().toArray().filter(
      func(booking) { booking.timeSlot == timeSlot }
    ).sort(PickupBooking.compareByTimestamp);
  };

  public query ({ caller }) func getPickupsByStatus(status : PickupBookingStatus) : async [PickupBooking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can filter pickup bookings");
    };
    pickupBookings.values().toArray().filter(
      func(booking) { booking.status == status }
    ).sort(PickupBooking.compareByTimestamp);
  };

  public type DealerRegistrationType = {
    #seller;
    #buyer;
  };

  public type DealerKycStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type DealerRegistration = {
    id : Text;
    registrantPrincipal : Principal;
    registrationType : DealerRegistrationType;
    pan : Text;
    gst : Text;
    aadhaarHash : Text;
    mobile : Text;
    businessName : Text;
    kycStatus : DealerKycStatus;
    timestamp : Time.Time;
  };

  module DealerRegistration {
    public func compareByTimestamp(reg1 : DealerRegistration, reg2 : DealerRegistration) : Order.Order {
      Int.compare(reg2.timestamp, reg1.timestamp);
    };
  };

  var nextDealerRegistrationId = 1;
  let dealerRegistrations = Map.empty<Text, DealerRegistration>();

  public shared ({ caller }) func submitDealerRegistration(pan : Text, gst : Text, aadhaarHash : Text, mobile : Text, businessName : Text, registrationType : DealerRegistrationType) : async Text {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please login to register as a dealer");
    };

    nextDealerRegistrationId += 1;
    let id = generateId("dealer_registration", nextDealerRegistrationId);

    let registration : DealerRegistration = {
      id;
      registrantPrincipal = caller;
      registrationType;
      pan;
      gst;
      aadhaarHash;
      mobile;
      businessName;
      kycStatus = #pending;
      timestamp = Time.now();
    };

    dealerRegistrations.add(id, registration);
    id;
  };

  public query ({ caller }) func getMyDealerRegistration() : async ?DealerRegistration {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please login to view your dealer registration");
    };
    let registrations = dealerRegistrations.values().toArray();
    switch (registrations.find(func(reg) { reg.registrantPrincipal == caller })) {
      case (null) { null };
      case (?registration) { ?registration };
    };
  };

  public query ({ caller }) func getAllDealerRegistrations() : async [DealerRegistration] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all dealer registrations");
    };
    dealerRegistrations.values().toArray().sort(DealerRegistration.compareByTimestamp);
  };

  public shared ({ caller }) func updateDealerKycStatus(registrationId : Text, newStatus : DealerKycStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update dealer KYC status");
    };

    switch (dealerRegistrations.get(registrationId)) {
      case (null) { Runtime.trap("Dealer registration not found") };
      case (?registration) {
        let updatedRegistration = {
          registration with
          kycStatus = newStatus;
        };
        dealerRegistrations.add(registrationId, updatedRegistration);
      };
    };
  };
};
