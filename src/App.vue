
<script>
import HelloWorld from './components/HelloWorld'
import ApiImage from './components/ApiImage'
import VueResizable from 'vue-resizable'
import samplePhoto from '../assets/images/1ABC-character-design.png'
import { loadImage } from './images'

export default {
  name: 'App',

  components: {
    HelloWorld,
    ApiImage,
    VueResizable
  },

  created() {
    fetch('library').then(x => x.json()).then(library => {
      this.library = library
      this.selectFrame(library.collections[1].frames[0])
    })
    fetch(samplePhoto).then(x => x.blob()).then(blob => {
      this.loadPhoto(blob)
    })
  },
  mounted() {
    window.photoBox = this.$refs.photoBox
  },
  data: () => ({
    name: 'hero',
    frame: null,
    drawer: false,
    drawerRight: false,
    drawerLeft: false,
    library: null,
    photoUrl: null,
    photo: {
      left: 0,
      top: 0,
      width: 10,
      height: 10,
      naturalWidth: 10,
      naturalHeight: 10
    },
    overlayUrl: null,
    overlay: {
      left: 0,
      top: 0,
      width: 10,
      height: 10,
      naturalWidth: 10,
      naturalHeight: 10
    },
    maskUrl: null,
    backgroundColor: '#ffffff',
    swatches: [
      [
        '#ff0000',
        '#00ff00',
      ],
      [
        '#0000ff',
        '#00ffff',
      ],
      [
        '#ff00ff',
        '#ffff00',
      ],
      [
        '#ffffff',
        '#000000'
      ]
    ]
  }),

  methods: {
    selectFrame(frame) {
      Promise.all([
        loadImage(frame.overlayPath).then(img => {
          this.overlayUrl = img.objectUrl
          this.overlay.naturalWidth = img.width
          this.overlay.naturalHeight = img.height
        }),
        loadImage(frame.maskPath).then(img => {
          this.maskUrl = img.objectUrl
        })
      ]).then(() => {
        this.frame = frame
        this.save()
      })
    },
    loadPhoto(blob) {
      if (!blob.url) blob.url = URL.createObjectURL(blob)
      this.photoUrl = blob.url
    },
    photoResize({eventName, left, top, width, height}) {
      if (isNaN(left)) throw new Error('Bad resize')
      this.photo.left = left
      this.photo.top = top
      this.photo.width = width
      this.photo.height = height
      this.save()
    },
    onPhotoLoad(ev) {
      this.photo.naturalWidth = this.$refs.photo.naturalWidth
      this.photo.naturalHeight = this.$refs.photo.naturalHeight
      this.photo.width = this.$refs.photo.naturalWidth
      this.photo.height = this.$refs.photo.naturalHeight
      this.$refs.photoBox.l = (document.documentElement.clientWidth - this.$refs.photo.naturalWidth) / 2
      this.$refs.photoBox.t = 0
      this.$refs.photoBox.$emit('resize', {
        eventName: 'load',
        left: this.$refs.photoBox.l,
        top: this.$refs.photoBox.t,
        width: this.$refs.photo.naturalWidth,
        height: this.$refs.photo.naturalHeight
      })

    },
    onMousewheel(ev, img) {
      ev.preventDefault()
      if (!ev.deltaY) return
      const d = ev.deltaY / Math.abs(ev.deltaY)
      const box = this.$refs.photoBox
      const x = ev.offsetX, y = ev.offsetY
      const rTop = y
      const rLeft = x
      const rRight = box.w - x
      const rBottom = box.h - y
      const strength = (ev.altKey ? 0.001 : ev.shiftKey ? 0.01 : 0.1) * d

      const aspectRatio = (this.photo.naturalWidth / this.photo.naturalHeight)
      const newTop = box.t + rTop * strength
      const newLeft = box.l + rLeft * strength
      const newRight = box.l + box.w + rRight * -strength
      const newWidth = newRight - newLeft
      const newHeight = newWidth / aspectRatio
      const newBottom = box.b - (newHeight - box.h)
      const newAspectRatio = newWidth / newHeight
      if (newWidth > this.photo.naturalWidth * 100) return
      if (newWidth < this.photo.naturalWidth / 100) return
      box.t = newTop
      box.l = newLeft
      box.w = newWidth
      box.h = newHeight
      box.$emit('resize', {
        eventName: 'zoom',
        left: newLeft,
        top: newTop,
        width: newWidth,
        height: newHeight
      })
    },
    upload() {
      this.$refs.file.click()
    },
    fileUpload() {
      if (this.$refs.file.files[0]) {
        const reader = new FileReader()
        reader.addEventListener('load', () => {
          this.photoUrl = reader.result
        }, false)
        reader.readAsDataURL(this.$refs.file.files[0])
        this.name = this.$refs.file.files[0].name.split('.').reverse().slice(1).reverse().join('.')
      }
    },
    save() {
      const canvas = this.$refs.output
      canvas.width = this.overlay.naturalWidth
      canvas.height = this.overlay.naturalHeight
      const s = this.$refs.overlay.offsetWidth / this.overlay.naturalWidth

      const ctx = canvas.getContext('2d')

      // Draw background
      ctx.fillStyle = this.backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw hero
      ctx.drawImage(
        this.$refs.photo,
        this.photo.left * s - this.$refs.overlay.offsetLeft,
        this.photo.top * s - this.$refs.overlay.offsetTop,
        this.photo.width * s,
        this.photo.height * s
      )

      // Draw mask
      ctx.drawImage(this.$refs.mask, 0, 0, canvas.width, canvas.height)

      // Get pixel data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const a = data[i + 3]
        if (r === 255 && g === 0 && b === 255 && a === 255) {
          data[i + 3] = 0
        }
      }
      ctx.putImageData(imageData, 0, 0)

      ctx.drawImage(this.$refs.overlay, 0, 0, canvas.width, canvas.height)
    },
    download() {
      const canvas = this.$refs.output

      const a = document.createElement('a')
      a.href = canvas.toDataURL()
      a.download = `${this.name}-${this.frame.name}.png`
      a.click()
    }
  }
}
</script>

<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawerRight"
      app
      clipped
      right
    >
      <v-expansion-panels v-if="library">
        <v-expansion-panel>
          <v-expansion-panel-header>
            <span>
              <span
                class="background-color-preview"
                :style="{backgroundColor}"
              />
              Background Color
            </span>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-color-picker
              v-model="backgroundColor"
              :show-swatches="true"
              :swatches="swatches"
            />
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel v-for="(collection, i) in library.collections" :key="i">
          <v-expansion-panel-header>{{collection.name}}</v-expansion-panel-header>
          <v-expansion-panel-content>
            <button class="frame" v-for="(frame, i) in collection.frames" :key="i" @click="selectFrame(frame)">
              <api-image :src="frame.thumbnailPath" />
            </button>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-navigation-drawer>
    <v-app-bar
      app
      clipped-right
      color="primary"
      dark
    >
      <v-toolbar-title>Token Tool</v-toolbar-title>
      <v-spacer />
      <v-app-bar-nav-icon @click.stop="drawerRight = !drawerRight" />
    </v-app-bar>
    <v-content>
      <div class="workspace">
        <vue-resizable
          ref="photoBox"
          v-if="photo"
          :width="photo.naturalWidth"
          :height="photo.naturalHeight"
          @resize="photoResize"
          @resize:start="photoResize"
          @resize:move="photoResize"
          @resize:end="photoResize"
          @drag:start="photoResize"
          @drag:move="photoResize"
          @drag:end="photoResize"
          drag-selector="img"
        >
          <img ref="photo"
            class="photo"
            :src="photoUrl"
            @load="onPhotoLoad"
            width="100%"
            height="100%"
            @mousewheel="onMousewheel($event, 'photo')"
          />
        </vue-resizable>
        <div class="centered-container">
          <img ref="overlay"
            class="overlay"
            :src="overlayUrl"
          />
        </div>
        <img ref="mask"
          class="mask"
          :src="maskUrl"
        />
        <div class="centered-container">
          <canvas class="output" ref="output" />
        </div>
      </div>
      <input type="file" ref="file" accept="image/png, image/jpeg" @input="fileUpload" />
    </v-content>
    <v-bottom-navigation :value="null">
      <v-btn value="upload" @click="upload">
        <span>Upload</span>
        <v-icon>mdi-upload</v-icon>
      </v-btn>
      <v-btn value="download" @click="download">
        <span>Download</span>
        <v-icon>mdi-download</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<style lang="less" scoped>
@import url('~vue-draggable-resizable/dist/VueDraggableResizable.css');
.workspace {
  user-select: none;
  position: relative;
  .resizable-component {
    position: absolute;
  }
  .mask { display: none; }
  .centered-container {
    position: absolute;
    width: 100vw;
    text-align: center;
    pointer-events: none;
    padding-top: 50px;
  }
  .photo {
    cursor: move;
    opacity: 0.25;
  }
  text-align: center;
}

.background-color-preview {
  display: inline-block;
  height: 15px;
  width: 15px;
  border-radius: 7px;
  transform: translateY(2px);
  margin-right: 5px;
}
.v-content {
  z-index: 0;
}
/deep/ .v-color-picker__color {
  width: 35px;
}
/deep/ .v-color-picker__input input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
input[type="file"] {
  display: none;
}
</style>

<style lang="less">
body, html {
  overflow: hidden;
}
</style>