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
    getCallerMessagesWithUser(user: Principal): Promise<Array<Message>>;
    getCallerRelatedListings(): Promise<Array<Listing>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getListingById(listingId: string): Promise<Listing | null>;
    getMessagesForListing(listingId: string): Promise<Array<Message>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    postMessage(listingId: string, recipient: Principal, content: string): Promise<string>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchListings(searchText: string): Promise<Array<Listing>>;
}
