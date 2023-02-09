<script lang="ts">
  import type { PageData, ActionData } from "./$types";
  import PhUserBold from "~icons/ph/user-bold";
  import PhCurrencyEurBold from '~icons/ph/currency-eur-bold'

  import { enhance } from "$app/forms";
  import { scale, slide } from "svelte/transition";
  import FormSuccess from "../../components/FormSuccess.svelte";
  import type { SubmitFunction } from "@sveltejs/kit";

  export let data: PageData;

  export let form: ActionData;

  const formResetEnhancementGenerator = (formName: string): SubmitFunction => {
    return (() => {
      return async ({ result, update }) => {
        try {
          if (result.data[formName]?.success) {
            update({ reset: true });
          } else {
            update({ reset: false });
          }
        } catch (e) {
          update({ reset: false });
        }

        // After 10 seconds reset the form information to its initial state
        setTimeout(() => {
          if (form)
            form[formName] = undefined;
        }, 10000);
      };
    }) as SubmitFunction;
    };

  const createUserAccount = formResetEnhancementGenerator('createUserAccount');
  const insertCustomDonation = formResetEnhancementGenerator('insertCustomDonation');

</script>

<div class="container h-full mx-auto flex justify-center items-center">
  <div class="card px-4 py-1 w-full">
    <div class="self-center justify-self-center variant-glass-surface rounded-xl py-2 px-5 mx-auto my-4">
      <h3>Create a user if he doesn't exist.</h3>

        <form class="p-4 grid gap-4" action="?/createUserAccount" method="POST" use:enhance={createUserAccount}>
          <label class="label">
            <span>SteamID or profile URL</span>
            <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
              <div class="input-group-shim">
                <PhUserBold />
              </div>
              <input name="userURL" placeholder="SteamID" type="search" />
              <button class="variant-filled-secondary">Submit</button>
            </div>
          </label>
        </form>
      <FormSuccess successData={form?.createUserAccount} />
    </div>
    <div class="self-center justify-self-center variant-glass-surface rounded-xl py-2 px-5 mx-auto my-4">
      <h3>Add a custom donation to the system. (If it was outside of KOFI or not correctly tracked)</h3>
        <form class="p-4 flex flex-col gap-4 align-middle items-center justify-evenly" action="?/insertCustomDonation" method="POST" use:enhance={insertCustomDonation}>
          <div class="grid gap-4 grid-cols-1 grid-flow-row-dense md:grid-cols-2 align-middle items-center justify-evenly">
            <label class="label">
              <span>Optional SteamID or profile URL</span>
              <div class="input-group input-group-divider grid-cols-[auto_1fr_auto] w-96">
                <div class="input-group-shim">
                  <PhUserBold />
                </div>
                <input name="userURL" placeholder="SteamID" type="text"/>
              </div>
            </label>
            <label class="label">
              <span>Amount</span>
              <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
                <div class="input-group-shim"><PhCurrencyEurBold/></div>
                <input type="number" name="amount" placeholder="Amount in €" />
              </div>
            </label>
            <label class="label">
              <span>Display Name</span>
              <div class="input-group input-group-divider grid-cols-[auto_1fr_auto] w-96">
                <div class="input-group-shim">
                  <PhUserBold />
                </div>
                <input name="displayName" placeholder="Peter" type="text" />
              </div>
            </label>
            <label class="label">
              <span>Message (can be left empty)</span>
              <textarea class="textarea" rows="4" placeholder="Message" name="message"></textarea>
            </label>
          </div>

          <button class="variant-filled-secondary btn max-w-xl">Submit</button>
        </form>
      <FormSuccess successData={form?.insertCustomDonation} />
      </div>

  </div>


</div>
