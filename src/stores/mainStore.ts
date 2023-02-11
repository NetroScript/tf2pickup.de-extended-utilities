import { localStorageStore } from '@skeletonlabs/skeleton';
import type { Writable } from 'svelte/store';

export const openTab: Writable<number> = localStorageStore('openTab', 0);
