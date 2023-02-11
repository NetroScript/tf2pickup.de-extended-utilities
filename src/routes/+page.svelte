<script lang='ts'>
	import type { PageData } from './$types';
	import { Avatar, Tab, TabGroup } from '@skeletonlabs/skeleton';
	import SvelteMarkdown from 'svelte-markdown';

	import PhCoinsDuotone from '~icons/ph/coins-duotone';
	import PhPresentationChartDuotone from '~icons/ph/presentation-chart-duotone';
	import { slide } from 'svelte/transition';
	import { openTab } from '../stores/mainStore';

	export let data: PageData;


</script>

<svelte:head>
  <title>tf2pickup.de - Donation Overview Page</title>
</svelte:head>

<div class='container max-w-[1200px] mx-auto px-4 py-10 !pt-8 md:py-20 space-y-10'>
  <section class='text-center space-y-3'>
    <h2>Kennzahlen</h2>
    <ul class='grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[800px] mx-auto text-2xl'>
      <li class='card variant-glass p-4 space-y-4'>
        Aktueller Stand:
        <div
          class='font-black drop-shadow' class:negative-balance={data.total < 0}
          class:positive-balance={data.total >= 0}>
          {data.total.toFixed(2)}€
        </div>
      </li>
      <li class='card variant-glass p-4 space-y-4'>
        Geld gespendet:
        <div
          class='font-black drop-shadow bg-gradient-to-br from-blue-500 to-cyan-300 bg-clip-text text-transparent box-decoration-clone'>
          {data.totalDonations.toFixed(2)}€
        </div>
      </li>
      <li class='card variant-glass p-4 space-y-4'>
        Ausgaben:
        <div
          class='font-black drop-shadow bg-gradient-to-br from-red-500 to-yellow-500 bg-clip-text text-transparent box-decoration-clone'>
          {data.totalCosts.toFixed(2)}€
        </div>
      </li>
    </ul>
  </section>

  <section class='text-center space-y-3'>
    <h2>Top Spender</h2>

    <ul class='grid grid-cols-1 grid-flow-row-dense md:grid-cols-3 gap-4 mx-auto text-2xl'>
      {#each data.topDonators as donator, index}
        <li
          class='card variant-glass p-4 space-y-4 flex flex-col align-middle items-center justify-evenly donator-{index}'>
          <div class='flex align-middle items-center text-center'>
            <Avatar initials='{donator.display_name[0]}' class='mr-3 min-w-[3em]'
                    src='{donator.steamUser?.avatar.medium}' />
            {donator.display_name}
          </div>
          <hr class=' min-w-full' />
          <div
            class='font-black drop-shadow donation-text-{index}'>
            {donator.amount.toFixed(2)}€
          </div>
        </li>
      {/each}
    </ul>
  </section>

  <section class='card variant-soft space-y-3 overflow-hidden !ring-1 drop-shadow-xl'>
    <div class='block flex'>
      <div class='bg-surface-50-900-token flex-1 lg:flex-0'>
        <TabGroup active='variant-filled-primary'
                  border=''
                  flex='flex-1 lg:flex-none'
                  hover='hover:variant-soft-primary'
                  justify='justify-center'
                  rounded=''>
          <Tab bind:group={$openTab} name='tab1' value={0}>
            <svelte:fragment slot='lead'>
              <div class='flex justify-center'>
                <PhCoinsDuotone style='font-size: 2em;' />
              </div>
            </svelte:fragment>
            Spenden
          </Tab>
          <Tab bind:group={$openTab} name='tab2' value={1}>
            <svelte:fragment slot='lead'>
              <div class='flex justify-center'>
                <PhPresentationChartDuotone style='font-size: 2em; transform: scaleX(-1);' />
              </div>
            </svelte:fragment>
            Kosten
          </Tab>
        </TabGroup>
      </div>
    </div>


    {#if $openTab === 0}
      <section class='text-center space-y-3 p-3' in:slide={{delay: 300, duration: 200}} out:slide={{duration:200}}>
        <h2 class='mb-8'>Spenden</h2>
        <ul class='flex flex-col mx-auto text-2xl gap-4'>
          {#each data.donations as donation}
            <li class='card variant-ghost drop-shadow p-2 '>
              <div class='flex items-center align-middle gap-4'>
                <Avatar initials='{donation.display_name[0]}' class='mr-3 min-w-[3em]'
                        src='{donation.steamUser?.avatar.medium}' />
                <div class='flex-1 text-left flex flex-col min-h-[72px]'>
                  <b>{donation.display_name}</b>
                  {#if donation.message}

                    <div class='font-mono flex-1 text-base'>
                      {donation.message}
                    </div>
                  {:else}
                    <div class='flex-1' />
                  {/if}
                  <div class='text-xs text-gray-500 text-center'>
                    {(donation.time).toLocaleString("de")}
                  </div>
                </div>

                <div class='card variant-glass p-4 text-green-500 dark:text-green-500 min-w-[72px]'>
                  {donation.amount.toFixed(2)}€
                </div>
              </div>


            </li>
          {/each}
          {#if data?.donations.length === 0}
            <div class='card variant-glass p-4 text-center'>
              Noch keine Spenden bisher :c.
            </div>
          {/if}
        </ul>
      </section>
    {:else if $openTab === 1}
      <section class='text-center space-y-3 p-3' in:slide={{delay: 300, duration: 200}} out:slide={{duration:200}}>
        <h2 class='mb-8'>Kosten</h2>
        <ul class='flex flex-col mx-auto text-2xl gap-4'>
          {#each data.costs as cost}
            <li class='card variant-ghost drop-shadow p-4 flex items-center align-middle gap-4'>
              <div class='card variant-glass p-4 text-red-700'>
                -{cost.amount.toFixed(2)}€
              </div>
              <div class='font-mono flex-1 text-base text-left prose dark:prose-invert prose-neutral max-w-none'>
                <SvelteMarkdown source='{cost.message}' />
                <div class='text-xs text-gray-500 text-center not-prose'>
                  {(cost.time).toLocaleString("de")}
                </div>
              </div>
            </li>
          {/each}
          {#if data.costs.length === 0}
            <div class='card variant-glass p-4 text-center'>
              Oha, noch gar keine Kosten!
            </div>
          {/if}
        </ul>
      </section>
    {/if}


  </section>

</div>

<style lang='postcss'>
    .positive-balance {
        @apply bg-gradient-to-br from-green-500 to-lime-300 bg-clip-text text-transparent box-decoration-clone;
    }

    .negative-balance {
        @apply bg-gradient-to-br from-red-700 to-red-800 bg-clip-text text-transparent box-decoration-clone;
    }

    .donation-text-0 {
        @apply bg-gradient-to-br from-amber-800 to-amber-400 bg-clip-text text-transparent box-decoration-clone;
        font-size: 150%;
    }

    .donation-text-1 {
        @apply bg-gradient-to-br from-gray-100 to-gray-700 bg-clip-text text-transparent box-decoration-clone;
        font-size: 125%;
    }

    .donation-text-2 {
        @apply bg-gradient-to-br from-yellow-800 to-amber-900 bg-clip-text text-transparent box-decoration-clone;
    }

    .donator-0 {
        @apply font-black;
    }

    .donator-1 {
        @apply font-bold;
    }

</style>
