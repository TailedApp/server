<script lang='ts'>
  import { Router, Route } from 'svelte-routing';
  import Console from './lib/Console.svelte';
  import Home from './lib/Home.svelte';
</script>

<svelte:head>
    <style>
        @import url('https://fonts.googleapis.com/css?family=Roboto&display=swap');
        @import url('https://fonts.googleapis.com/css?family=Roboto+Mono&display=swap');
    </style>
</svelte:head>

<style>

</style>

<main>
  <Router>
    <Route path="/:id" component={Console} />
    <Route path="/" component={Home} />
  </Router>
</main>
