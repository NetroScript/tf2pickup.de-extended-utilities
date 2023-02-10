<script lang='ts'>
	import '../app.pcss';
	import '@skeletonlabs/skeleton/styles/all.css';
	import { AppBar, AppShell, Avatar, LightSwitch, menu } from '@skeletonlabs/skeleton';
	import { scale, slide } from 'svelte/transition';

	import type { LayoutData } from './$types';

	export let data: LayoutData;

	let showProfileDropdown = false;

</script>
<AppShell>

  <svelte:fragment slot='header'>
    <AppBar background='bg-surface-50-900-token' padding='px-4 py-2'>
      <svelte:fragment slot='lead'>
        <a class='align-middle justify-evenly items-center flex ' href='/'>
          <img alt='tf2pickup.de Logo' class='h-16 mr-4' src='/tf2pickup.png'>
          <strong class='text-xl uppercase hidden md:block'>tf2pickup.de Spenden</strong>
        </a>
      </svelte:fragment>
      <div class='flex space-x-2'>
        {#if data.user && data.user.admin}
          <a href='/admin' class='text-sm uppercase btn variant-soft'>Administration</a>
        {/if}
        <a class='text-sm uppercase btn variant-soft' href='/about'>Infos</a>
        <div class='flex-1'></div>
        <a class='text-sm uppercase btn variant-soft-success' href='https://ko-fi.com/tf2pickupde'>Spenden</a>
      </div>

      <svelte:fragment slot='trail'>


        {#if data.user}

          <div class='relative'>
            <button on:click={() => {showProfileDropdown=!showProfileDropdown}}
                    class='flex align-middle justify-evenly items-center cursor-pointer'>
              <span class='px-3'>{data.user.username}</span>
              <Avatar src='{data.user.avatar.medium}'></Avatar>
            </button>

            {#if showProfileDropdown}
              <div
                class='card p-4 shadow-xl text-center absolute right-0 top-[64px] rounded-t-none !ring-0 border-t-0 bg-surface-50-900-token'
                transition:slide={{duration: 100}}>
                <div class='flex flex-col gap-4 justify-evenly align-middle items-center'>
                  <a href='/auth/logout' class='text-sm uppercase btn variant-ghost'
                     on:click={data.user = null}>Logout</a>
                  <LightSwitch />
                </div>

              </div>
            {/if}


          </div>


        {:else}
          <a href='/auth/steam' on:click={() => {
            // Set a cookie so we can redirect the user back to the page they were on
            document.cookie = `returnURL=${window.location.pathname};path=/;max-age=86400`;
          }} class='text-sm uppercase btn variant-ghost-success'>Login</a>
        {/if}
      </svelte:fragment>
    </AppBar>

  </svelte:fragment>

  <slot />
</AppShell>

