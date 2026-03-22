import { ExternalBlob, ListingCategory, ListingCondition } from "@/backend";
import type { Listing, UserProfile } from "@/backend";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export { ListingCategory, ListingCondition, ExternalBlob };
export type { Listing, UserProfile };

export function useListings(category: ListingCategory | "all", search = "") {
  const { actor, isFetching } = useActor();
  return useQuery<Listing[]>({
    queryKey: ["listings", category, search],
    queryFn: async () => {
      if (!actor) return [];
      if (search.trim()) return actor.searchListings(search.trim());
      if (category === "all") return actor.searchListings("");
      return actor.filterByCategory(category);
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useGetListing(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Listing | null>({
    queryKey: ["listing", id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getListingById(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useGetMessagesForListing(listingId: string, enabled = true) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["messages", listingId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMessagesForListing(listingId);
    },
    enabled: !!actor && !isFetching && !!listingId && enabled,
    refetchInterval: enabled ? 4000 : false,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetCallerRelatedListings() {
  const { actor, isFetching } = useActor();
  return useQuery<Listing[]>({
    queryKey: ["callerListings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerRelatedListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateListing() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (listing: Listing) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createListing(listing);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["callerListings"] });
    },
  });
}

export function useDeleteListing() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (listingId: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteListing(listingId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["callerListings"] });
    },
  });
}

export function usePostMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      listingId,
      recipient,
      content,
    }: {
      listingId: string;
      recipient: Principal;
      content: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.postMessage(listingId, recipient, content);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["messages", vars.listingId] });
    },
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useGetSellerProfile(principalStr: string) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["sellerProfile", principalStr],
    queryFn: async () => {
      if (!actor || !principalStr) return null;
      // Dynamically import Principal to convert string -> Principal
      const { Principal } = await import("@icp-sdk/core/principal");
      try {
        return actor.getUserProfile(Principal.fromText(principalStr));
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!principalStr,
    staleTime: 60_000,
  });
}
