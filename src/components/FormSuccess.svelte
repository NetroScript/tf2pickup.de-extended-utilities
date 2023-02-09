<script lang="ts">
  import PhCheckCircleDuotone from "~icons/ph/check-circle-duotone";
  import PhXCircleDuotone from "~icons/ph/x-circle-duotone";
  export let successData: { success: boolean, error: string };

  import { scale, slide } from "svelte/transition";

</script>

{#if successData}
  {#if successData.success}
    <aside class="alert variant-ghost-success" transition:slide={{duration: 200}}>
      <div>
        <PhCheckCircleDuotone style="font-size: 2rem;" />
      </div>

      <div class="alert-message">
        <h4>Success</h4>
      </div>
    </aside>
  {:else}
    <aside class="alert variant-ghost-error" transition:slide={{duration: 200}}>
      <div>
        <PhXCircleDuotone style="font-size: 2rem;" />
      </div>

      <div class="alert-message">
        <h4>Error</h4>
        <p>{successData.error}</p>
      </div>
    </aside>
  {/if}
{/if}
