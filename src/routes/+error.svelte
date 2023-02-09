<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="container h-full mx-auto flex justify-center items-center flex-col">
  <h1>{$page.status}</h1>
  {#if $page.error}
    <span>{$page.error.message}</span>
  {:else }
    <span>Something went wrong</span>
  {/if}
</div>
