<template>
  <div class="webpage">
    <h1>Looker Counter Extension (Vue)</h1>
    <h3>This number will increase by one upon every click:</h3>
    <Button></Button>
    <h3>We hope you had fun with this Looker extension.</h3>
    <img
      width="200"
      src="./looker-logo.svg"
    />
  </div>
</template>

<script>
import Button from './Button.vue'

</script>

<style>
body {
  font-family: -apple-system, system-ui, BlinkMacSystemFont;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.webpage {
  padding: 100px 0;
}
</style>