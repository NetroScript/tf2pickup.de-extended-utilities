<script lang="ts">
	import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
	import '@skeletonlabs/skeleton/styles/all.css';
	import '../app.postcss';
  import { AppBar, AppShell, Avatar, LightSwitch, menu } from "@skeletonlabs/skeleton";
  import { scale, slide } from 'svelte/transition';

  import type { LayoutData } from './$types';

  export let data: LayoutData;

  let showProfileDropdown = true;

</script>
<AppShell>

  <svelte:fragment slot="header">
    <AppBar padding="px-4 py-2">
      <svelte:fragment slot="lead">
        <a href="/" class="flex align-middle justify-evenly items-center">
          <img class="h-16 mr-4" src="/tf2pickup.png">
          <strong class="text-xl uppercase">tf2pickup.de Donations</strong>
        </a>

      </svelte:fragment>
      <svelte:fragment slot="trail">
        {#if data.user}

          <div class="relative">
            <div on:click={() => {showProfileDropdown=!showProfileDropdown}} class="flex align-middle justify-evenly items-center cursor-pointer">
              <span class="px-3">{data.user.username}</span>
              <Avatar src="{data.user.avatar.medium}"></Avatar>
            </div>

            {#if showProfileDropdown}
              <div class="card p-4 shadow-xl text-center absolute right-0 top-[64px] rounded-t-none !ring-0 border-t-0" transition:slide={{duration: 100}}>
                <div class="flex flex-col gap-4 justify-evenly align-middle items-center">
                  <a href="/auth/logout" class="text-sm uppercase btn variant-ghost" on:click={data.user = undefined}>Logout</a>
                  <LightSwitch />
                </div>

              </div>
            {/if}


          </div>


        {:else}
          <a href="/auth/steam" class="text-sm uppercase btn variant-ghost-success">Login</a>
        {/if}
      </svelte:fragment>
    </AppBar>

  </svelte:fragment>

  <slot />
</AppShell>

