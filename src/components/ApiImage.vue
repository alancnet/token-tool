<script>
import { loadImage } from '../images'
export default {
  props: {
    src: String
  },
  data() {
    return {
      imgSrc: null
    }
  },
  watch: {
    src: {
      immediate: true,
      async handler(value, oldValue) {
        this.image = await loadImage(value)
        console.log(this.image)
        this.imgSrc = this.image.objectUrl
      }
    }
  }
}
</script>
<template>
  <img class="api-image" :src="imgSrc" />
</template>