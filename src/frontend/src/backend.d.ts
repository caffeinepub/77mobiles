import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Listing {
    id: string;
    title: string;
    description: string;
    seller: Principal;
    timestamp: Time;
    category: ListingCategory;
    price: bigint;
    location: string;
    condition: ListingCondition;
    images: Array<ExternalBlob>;
}
export interface DealerRegistration {
    id: string;
    gst: string;
    pan: string;
    registrantPrincipal: Principal;
    businessName: string;
    kycStatus: DealerKycStatus;
    timestamp: Time;
    aadhaarHash: string;
    mobile: string;
    registrationType: DealerRegistrationType;
}
export interface PickupBooking {
    id: string;
    status: PickupBookingStatus;
    date: string;
    sellerName: string;
    address: string;
    timestamp: Time;
    phone: string;
    quotedPrice: bigint;
    timeSlot: string;
    deviceModel: string;
}
export interface Message {
    id: string;
    content: string;
    listingId: string;
    recipient: Principal;
    sender: Principal;
    timestamp: Time;
}
export interface UserProfile {
    name: string;
    isVerified: boolean;
    aadhaarHash: string;
    phone: string;
}
export enum DealerKycStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum DealerRegistrationType {
    seller = "seller",
    buyer = "buyer"
}
export enum ListingCategory {
    watches = "watches",
    earphones = "earphones",
    macbooks = "macbooks",
    phones = "phones"
}
export enum ListingCondition {
    new_ = "new",
    fair = "fair",
    good = "good",
    likeNew = "likeNew"
}
export enum PickupBookingStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    confirmed = "confirmed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createListing(listing: Listing): Promise<string>;
    deleteListing(listingId: string): Promise<void>;
    filterByCategory(category: ListingCategory): Promise<Array<Listing>>;
    filterByCondition(condition: ListingCondition): Promise<Array<Listing>>;
    filterByPriceRange(minPrice: bigint, maxPrice: bigint): Promise<Array<Listing>>;
    getAllDealerRegistrations(): Promise<Array<DealerRegistration>>;
    getAllListings(): Promise<Array<Listing>>;
    getAllListingsByPrice(): Promise<Array<Listing>>;
    getAllMessages(): Promise<Array<Message>>;
    getAllPickupBookings(): Promise<Array<PickupBooking>>;
    getAllUserProfiles(): Promise<Array<UserProfile>>;
    getCallerMessagesWithUser(user: Principal): Promise<Array<Message>>;
    getCallerRelatedListings(): Promise<Array<Listing>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getListingById(listingId: string): Promise<Listing | null>;
    getMessagesForListing(listingId: string): Promise<Array<Message>>;
    getMyDealerRegistration(): Promise<DealerRegistration | null>;
    getPickupBooking(bookingId: string): Promise<PickupBooking | null>;
    getPickupsByDate(date: string): Promise<Array<PickupBooking>>;
    getPickupsByStatus(status: PickupBookingStatus): Promise<Array<PickupBooking>>;
    getPickupsByTimeSlot(timeSlot: string): Promise<Array<PickupBooking>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    postMessage(listingId: string, recipient: Principal, content: string): Promise<string>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchListings(searchText: string): Promise<Array<Listing>>;
    submitDealerRegistration(pan: string, gst: string, aadhaarHash: string, mobile: string, businessName: string, registrationType: DealerRegistrationType): Promise<string>;
    submitPickupBooking(booking: PickupBooking): Promise<string>;
    updateBookingStatus(bookingId: string, newStatus: PickupBookingStatus): Promise<void>;
    updateDealerKycStatus(registrationId: string, newStatus: DealerKycStatus): Promise<void>;
}
