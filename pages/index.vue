<template>
  <section class="section">
    <div class="columns is-mobile">
      <LargeFileForm
        v-model="media.file"
        :upload-form="uploadMediaFile"
        :change-file-hash="createFileHash"
        :submitting="submitting"
        :upload-status="uploadStatus"
      />
    </div>
  </section>
</template>

<script>
export default {
  name: 'IndexPage',
  data() {
    return {
      media: {
        file: null,
      },
      submitting: false,
      uploadStatus: 'Submit File'
    }
  },
  methods: {
    createFileHash(event) {
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
      this.submitting = true
      this.uploadStatus = 'Submitting File'
      const fileSizeInBytes = this.media.file.size

      const size = 2048000 * 16
      // calculate the number of chunks to subdivide the file into
      const chunks = Math.ceil(fileSizeInBytes / size)
      const fileChunks = []
      const selectedFile = this.media.file
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
        await axios
          .put(fileChunkUploadUrl, formData, config)
          .then((response) => {
            fileChunkUploadUrl = response.data.url

            if (isLastChunk) {
              const finalChunkData = {
                md5: this.fileHash,
                object_id: this.offlineFileId,
              }
              if (this.currentRouteName === 'offline-files-upload') {
                finalChunkData.file_type = 'offline file'
              }
              axios
                .post(fileChunkUploadUrl, finalChunkData)
                .then((response) => {
                  if (response.status === 200) {
                    this.submitting = false
                    this.uploadStatus = 'Submit File'
                    this.$swal('', 'File Upload Successful', 'success')
                    this.$router.push({ name: 'offline-files-list' })
                  }
                })
                .catch((error) => {
                  this.submitting = false
                  this.uploadStatus = 'Submit File'
                  // eslint-disable-next-line no-console
                  console.log(error.response, 'final chunk error')
                })
            }
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.log(error.response)
          })
      }
    },
  },
}
</script>
