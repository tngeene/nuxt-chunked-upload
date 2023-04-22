<template>
  <form method="post" class="form" @submit.prevent="uploadMediaFile">
    <div class="file has-name is-right mb-2">
      <b-field label="Included filename">
        <b-field class="file is-primary" :class="{ 'has-name': !!media.file }">
          <b-upload v-model="media.file" class="file-label" rounded>
            <span class="file-cta">
              <b-icon class="file-icon" icon="upload"></b-icon>
              <span class="file-label">{{
                media.file.name || 'Click to upload'
              }}</span>
            </span>
          </b-upload>
        </b-field>
      </b-field>
    </div>
    <b-button
      :disabled="submitting"
      type="is-success"
      @click="uploadMediaFile"
    >
      {{ uploadStatus }} </b-button
    >
  </form>
</template>

<script>
export default {
  name: 'LargeFileForm',
  props: {
    label: {
      type: String,
      default: 'Upload File',
    },
  },
  data() {
    return {
      fileHash: '',
      fileChunkSize: 32768,
      submitting: false,
      media: {
        file: {},
      },
      uploadStatus: 'Upload File',
    }
  },
  methods: {
    snackbar(messageStr) {
      this.$buefy.snackbar.open({
        message: messageStr,
        position: 'is-top-right',
        type: 'is-warning',
        duration: 6000,
        actionText: 'Retry',

        onAction: () => {
          this.$buefy.toast.open({
            message: 'Resubmitting File',
            queue: false,
          })
        },
      })
    },
    createFileHash(event) {
      // eslint-disable-next-line no-console
      console.log('creating hash')
      const file = event.target.files[0]
      const spark = new SparkMD5.ArrayBuffer()
      const reader = new FileReader()
      const blobSlice =
        File.prototype.slice ||
        File.prototype.mozSlice ||
        File.prototype.webkitSlice
      
      const chunks = Math.ceil(file.size / this.fileChunkSize)
      
      let currentChunkIndex = 0
      
      reader.onload = (event) => {
        spark.append(event.target.result)
        currentChunkIndex++

        if (currentChunkIndex < chunks.length) {
          loadNext()
        } else {
          this.fileHash = spark.end()
        }
      }

      const loadNext = () => {
        const startIndex = currentChunkIndex * this.fileChunkSize
        const endIndex =
          startIndex + this.fileChunkSize >= file.size
            ? file.size
            : startIndex + this.fileChunkSize

        reader.readAsArrayBuffer(blobSlice.call(file, startIndex, endIndex))
      }
      loadNext()
    },

    async uploadMediaFile() {
      const fileSizeInBytes = this.media.file.size
      if (fileSizeInBytes > 0) {
      this.submitting = true
      this.uploadStatus = 'Submitting File'
      }

      const size = 2048000 * 16
      // calculate the number of chunks to subdivide the file into
      const chunks = Math.ceil(fileSizeInBytes / size)
      const fileChunks = []
      const selectedFile = this.media.file
      // eslint-disable-next-line no-console
      console.log(`${selectedFile} selected file while ${this.media} `, )
      for (let i = 0; i < chunks; i++) {
        fileChunks.push(
          selectedFile.slice(
            i * size,
            Math.min(i * size + size, fileSizeInBytes),
            this.media.file.type
          )
        )
      }
      const filename = this.media.file.name
      let fileChunkUploadUrl = 'v1/chunk-upload/'

      for (let index = 0; index < fileChunks.length; index++) {
        const chunk = fileChunks[index]
        const isLastChunk = index + 1 === fileChunks.length
        const formData = new FormData()
        formData.append('file', chunk)
        formData.append('filename', filename)
        const startIndex = index * size
        const endIndex = startIndex + (isLastChunk ? chunk.size : size)

        const config = {
          headers: {
            'Content-Range': `bytes ${startIndex}-${
              endIndex - 1
            }/${fileSizeInBytes}`,
          },
        }
        await this.$axios
          .put(fileChunkUploadUrl, formData, config)
          .then((response) => {
            // eslint-disable-next-line no-console
              console.log(`${response.stautus} status fr`)
            if (response.status === 200) {
              fileChunkUploadUrl = response.data.url
              if (isLastChunk) {
                const finalChunkData = {
                  md5: this.fileHash,
                  object_id: this.offlineFileId,
                }
                axios
                  .post(fileChunkUploadUrl, finalChunkData)
                  .then((response) => {
                    this.$toast.show('Uploading File')
                    if (response.status === 200) {
                      this.submitting = false
                      this.uploadStatus = 'Submit File'
                      this.$toast.success('File Upload Successful')
                      this.$router.push({ name: 'offline-files-list' })
                    } else {
                      this.$toast.error('Could not upload file.')
                    }
                  })
                  .catch(() => {
                    this.submitting = false
                    this.uploadStatus = 'Submit File'
                    // eslint-disable-next-line no-console
                    this.snackbar('Could not Upload Final Chunk')
                  })
              }
            } else {
              // eslint-disable-next-line no-console
              console.log(`${response.stautus} status`)
              this.submitting = false
              this.uploadStatus = 'Submit File'
              const errorMessage = 'Could not Upload File'
              this.snackbar(errorMessage)
            }
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.log(error.response)
            this.submitting = false
            this.uploadStatus = 'Submit File'
            const errorMessage = 'Could not Upload File'
            this.snackbar(errorMessage)
          })
      }
    },
  },
}
</script>
