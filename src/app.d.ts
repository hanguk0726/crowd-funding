// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            supabase: any,
            getSupabaseSession: () => Promise<any>
        }
        interface PageData { }
        interface PageState { }
        interface Platform { }
    }
}

export { };
