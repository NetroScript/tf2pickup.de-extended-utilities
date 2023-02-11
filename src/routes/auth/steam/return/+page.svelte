<script lang="ts">
  import type { PageData } from './$types';

  import { ProgressRadial } from "@skeletonlabs/skeleton";

  // Redirect to the home page if the user is logged in
  window.location.href = '/';
</script>


<div class="container h-full mx-auto flex justify-center items-center">
  <div class="w-full max-w-[320px] mx-auto space-y-4">
    <ProgressRadial></ProgressRadial>
  </div>
</div>
