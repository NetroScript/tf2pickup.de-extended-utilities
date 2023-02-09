<script lang="ts">
  import type { PageData } from "./$types";
  import { Avatar, Tab, TabGroup } from "@skeletonlabs/skeleton";
  import SvelteMarkdown from "svelte-markdown";

  import PhCoinsDuotone from "~icons/ph/coins-duotone";
  import PhPresentationChartDuotone from "~icons/ph/presentation-chart-duotone";
  import { slide } from "svelte/transition";

  export let data: PageData;

  console.log(data);

  let tabSet = 0;

</script>


<div class="container max-w-[1200px] mx-auto px-4 py-10 !pt-8 md:py-20 space-y-10">
  <section class="text-center space-y-3">
    <h2>Key Facts</h2>
    <ul class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[800px] mx-auto text-2xl">
      <div class="card variant-glass p-4 space-y-4">
        Current Balance:
        <div
          class="font-black drop-shadow" class:negative-balance={data.total < 0}
          class:positive-balance={data.total >= 0}>
          {data.total}€
        </div>
      </div>
      <div class="card variant-glass p-4 space-y-4">
        Total Money raised:
        <div
          class="font-black drop-shadow bg-gradient-to-br from-blue-500 to-cyan-300 bg-clip-text text-transparent box-decoration-clone">
          {data.totalDonations}€
        </div>
      </div>
      <div class="card variant-glass p-4 space-y-4">
        Total Money spent:
        <div
          class="font-black drop-shadow bg-gradient-to-br from-red-500 to-yellow-500 bg-clip-text text-transparent box-decoration-clone">
          {data.totalCosts}€
        </div>
      </div>
    </ul>
  </section>

  <section class="text-center space-y-3">
    <h2>Top Donators</h2>

    <ul class="grid grid-cols-1 grid-flow-row-dense md:grid-cols-3 gap-4 mx-auto text-2xl">
      {#each data.topDonators as donator, index}
        <div class="card variant-glass p-4 space-y-4 flex flex-col align-middle items-center justify-evenly">
          <div class="flex align-middle items-center text-center">
            <Avatar initials="{donator.display_name[0]}" class="mr-3 min-w-[3em]"
                    src="{donator.steamUser?.avatar.medium}" />
            {donator.display_name}
          </div>
          <hr class=" min-w-full" />
          <div
            class="font-black drop-shadow donator-{index}">
            {donator.amount}€
          </div>
        </div>
      {/each}
    </ul>
  </section>

  <section class="card variant-glass space-y-3 overflow-hidden !ring-1 drop-shadow-xl">
    <div class="block flex">
      <div class="bg-surface-50-900-token flex-1 lg:flex-0">
        <TabGroup active="variant-filled-primary"
                  border=""
                  flex="flex-1 lg:flex-none"
                  hover="hover:variant-soft-primary"
                  justify="justify-center"
                  rounded="">
          <Tab bind:group={tabSet} name="tab1" value={0}>
            <svelte:fragment slot="lead">
              <div class="flex justify-center">
                <PhCoinsDuotone style="font-size: 2em;" />
              </div>
            </svelte:fragment>
            Donations
          </Tab>
          <Tab bind:group={tabSet} name="tab2" value={1}>
            <svelte:fragment slot="lead">
              <div class="flex justify-center">
                <PhPresentationChartDuotone style="font-size: 2em; transform: scaleX(-1);" />
              </div>
            </svelte:fragment>
            Costs
          </Tab>
        </TabGroup>
      </div>
    </div>


    {#if tabSet === 0}
      <section class="text-center space-y-3 p-3" in:slide={{delay: 300, duration: 200}} out:slide={{duration:200}}>
        <h2 class="mb-8">Donations</h2>
        <ul class="flex flex-col mx-auto text-2xl gap-4">
          {#each data.donations as donation}
            <div class="card variant-glass p-2 ">
              <div class="flex items-center align-middle gap-4">
                <Avatar initials="{donation.display_name[0]}" class="mr-3 min-w-[3em]"
                        src="{donation.steamUser?.avatar.medium}" />
                <div class="flex-1 text-left flex flex-col min-h-[72px]">
                  <b>{donation.display_name}</b>
                  {#if donation.message}

                    <div class="font-mono flex-1 text-base">
                      {donation.message}
                    </div>
                  {:else}
                    <div class="flex-1" />
                  {/if}
                  <div class="text-xs text-gray-500 text-center">
                    {(new Date()).toLocaleString("de")}
                  </div>
                </div>

                <div class="card variant-glass p-4 text-green-500 dark:text-green-500">
                  {donation.amount}€
                </div>
              </div>


            </div>
          {/each}
          {#if data?.donations.length === 0}
            <div class="card variant-glass p-4 text-center">
              No donations yet :c.
            </div>
          {/if}
        </ul>
      </section>
    {:else if tabSet === 1}
      <section class="text-center space-y-3 p-3" in:slide={{delay: 300, duration: 200}} out:slide={{duration:200}}>
        <h2 class="mb-8">Costs</h2>
        <ul class="flex flex-col mx-auto text-2xl gap-4">
          {#each data.costs as cost}
            <div class="card variant-glass p-4 flex items-center align-middle gap-4">
              <div class="card variant-glass p-4 text-red-700">
                -{cost.amount}€
              </div>
              <div class="font-mono flex-1 text-base text-left">
                <SvelteMarkdown source="{cost.message}" />
                <div class="text-xs text-gray-500 text-center">
                  {(new Date()).toLocaleString("de")}
                </div>
              </div>
            </div>
          {/each}
          {#if data.costs.length === 0}
            <div class="card variant-glass p-4 text-center">
              Wow no costs yet!
            </div>
          {/if}
        </ul>
      </section>
    {/if}


  </section>

</div>

<style lang="postcss">
    .positive-balance {
        @apply bg-gradient-to-br from-green-500 to-lime-300 bg-clip-text text-transparent box-decoration-clone;
    }

    .negative-balance {
        @apply bg-gradient-to-br from-red-700 to-red-800 bg-clip-text text-transparent box-decoration-clone;
    }

    .donator-0 {
        @apply bg-gradient-to-br from-amber-800 to-amber-400 bg-clip-text text-transparent box-decoration-clone;
        font-size: 150%;
    }

    .donator-1 {
        @apply bg-gradient-to-br from-gray-100 to-gray-700 bg-clip-text text-transparent box-decoration-clone;
        font-size: 125%;
    }

    .donator-2 {
        @apply bg-gradient-to-br from-yellow-800 to-amber-900 bg-clip-text text-transparent box-decoration-clone;
    }
</style>
