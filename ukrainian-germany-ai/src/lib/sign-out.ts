import { supabase } from "@/integrations/supabase/client";
import { unsubscribeThisDevice } from "@/lib/push";

/** Sign-out also stops push on this device, so the next person on a shared device does not receive the previous user's reminders. */
export async function signOutOnThisDevice() {
  await unsubscribeThisDevice(endpoint => Promise.resolve(supabase.from("push_subscriptions").delete().eq("endpoint", endpoint)));
  await supabase.auth.signOut();
}
