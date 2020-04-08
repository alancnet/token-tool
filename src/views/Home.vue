<template>
  <div class="home">
    <api-image src="thumbnails/Chains/Blood Steel.png" />
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import ApiImage from '@/components/ApiImage.vue'
export default {
  name: 'Home',
  components: {
    HelloWorld,
    ApiImage
  }
}
</script>
