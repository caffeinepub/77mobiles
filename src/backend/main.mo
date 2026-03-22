import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Text "mo:core/Text";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
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
  let listings = Map.empty<Text, Listing>();
  let messages = Map.empty<Text, Message>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  public shared ({ caller }) func createListing(listing : Listing) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create listings");
    };
    nextListingId += 1;
    let id = "listing_" # nextListingId.toText();
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

  public query ({ caller }) func searchListings(searchText : Text) : async [Listing] {
    listings.values().toArray().filter(
      func(listing) {
        listing.title.contains(#text searchText) or listing.description.contains(#text searchText);
      }
    ).sort();
  };

  public query ({ caller }) func filterByCategory(category : ListingCategory) : async [Listing] {
    listings.values().toArray().filter(
      func(listing) {
        listing.category == category;
      }
    ).sort();
  };

  public query ({ caller }) func filterByCondition(condition : ListingCondition) : async [Listing] {
    listings.values().toArray().filter(
      func(listing) {
        listing.condition == condition;
      }
    ).sort();
  };

  public query ({ caller }) func filterByPriceRange(minPrice : Nat, maxPrice : Nat) : async [Listing] {
    listings.values().toArray().filter(
      func(listing) {
        listing.price >= minPrice and listing.price <= maxPrice;
      }
    ).sort(Listing.compareByPrice);
  };

  public query ({ caller }) func getListingById(listingId : Text) : async ?Listing {
    listings.get(listingId);
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

  public shared ({ caller }) func postMessage(listingId : Text, recipient : Principal, content : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (_) {
        nextMessageId += 1;
        let messageId = "msg_" # nextMessageId.toText();
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their listings");
    };
    listings.values().toArray().filter(func(listing) { listing.seller == caller }).sort();
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };
};
