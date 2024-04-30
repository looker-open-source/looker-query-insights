<script setup>
import { ref, computed, watchEffect, onMounted } from 'vue';
import panzoom, { beforeWheel, minZoom, initialZoom } from 'panzoom';
import LeftBanner from '../components/LeftBanner.vue'


onMounted(() => {
    var element = document.getElementById("zoom");
    // And pass it to panzoom
    panzoom(element, {
        maxZoom: 10,
        minZoom: 0.1,
        initialX: 300,
        initialY: 500,
        initialZoom: 0.5,
    })
})

</script>

<template>
    <div class="row">
        <LeftBanner></LeftBanner>
        <div class="column-center">
            <h1>ERD to LookML Generator</h1>
            <h3><router-link to="/" style="z-index:20;">Go Back</router-link></h3>
            <div style="position:absolute;top:0;left:0;width:100%;height:100%;padding:1.2rem;z-index:-1">
            <svg height="100%" width="100%" viewbox="0 0 0 0">
            <g id="zoom">
            <foreignObject id="zoom" x="0" y="0" width="1000" height="1000" style="width:100%; height:100vh">
            <div  style="height:20%; width:100%; padding-bottom: 2rem; max-height: 35%; z-index:2">
                <vue-draggable-resizable id="upload-container" :handles="['br']" :draggable="false" :resizable="true" class-name-draggable="card" :w="1000"  :parent="true">
                    <Toast />
                    <FileUpload  name="demo[]" url="/api/upload" @upload="onTemplatedUpload($event)" :multiple="true" accept="image/*" :maxFileSize="9000000" @select="onSelectedFiles">
                        <template #header="{ chooseCallback, uploadCallback, clearCallback, files }">
                            <div class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2">
                                <div class="flex gap-2">
                                    <Button @click="chooseCallback()" icon="pi pi-images" rounded outlined></Button>
                                    <Button @click="uploadEvent(uploadCallback)" icon="pi pi-cloud-upload" rounded outlined severity="success" :disabled="!files || files.length === 0"></Button>
                                    <Button @click="clearCallback()" icon="pi pi-times" rounded outlined severity="danger" :disabled="!files || files.length === 0"></Button>
                                </div>
                                <ProgressBar :value="totalSizePercent" :showValue="false" :class="['md:w-10rem h-1rem w-full md:ml-auto', { 'exceeded-progress-bar': totalSizePercent > 100 }]"
                                    ><span class="white-space-nowrap">{{ totalSize }}B / 1Mb</span></ProgressBar
                                    >
                                </div>
                            </template>
                            <template #content="{ files, uploadedFiles, removeUploadedFileCallback, removeFileCallback }">
                                <div v-if="files.length > 0">
                                    <h5>Pending</h5>
                                    <div class="flex flex-wrap p-0 sm:p-5 gap-5">
                                        <div v-for="(file, index) of files" :key="file.name + file.type + file.size" class="card m-0 px-6 flex flex-column border-1 surface-border align-items-center gap-3">
                                            <div>
                                                <img role="presentation" :alt="file.name" :src="file.objectURL" width="40" height="20" />
                                            </div>
                                            <span class="font-semibold">{{ file.name }}</span>
                                            <div>{{ formatSize(file.size) }}</div>
                                            <Badge value="Pending" severity="warning" />
                                            <Button icon="pi pi-times" @click="onRemoveTemplatingFile(file, removeFileCallback, index)" outlined rounded  severity="danger" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div v-if="uploadedFiles.length > 0">
                                    <h5>Completed</h5>
                                    <div class="flex flex-wrap p-0 sm:p-5 gap-5">
                                        <div v-for="(file, index) of uploadedFiles" :key="file.name + file.type + file.size" class="card m-0 px-2 flex flex-column border-1 surface-border align-items-center gap-3">
                                            <div>
                                                <img role="presentation" :alt="file.name" :src="file.objectURL" width="100" height="50" />
                                            </div>
                                            <span class="font-semibold">{{ file.name }}</span>
                                            <div>{{ formatSize(file.size) }}</div>
                                            <Badge value="Completed" class="mt-3" severity="success" />
                                            <Button icon="pi pi-times" @click="removeUploadedFileCallback(index)" outlined rounded  severity="danger" />
                                        </div>
                                    </div>
                                </div>
                            </template>
                            <template #empty>
                                <div class="flex align-items-center justify-content-center flex-column">
                                    <i class="pi pi-cloud-upload border-2 border-circle p-2 text-4xl text-400 border-400" />
                                    <p class="mt-2 mb-0">Drag and drop files to here to upload.</p>
                                </div>
                            </template>
                    </FileUpload>
                </vue-draggable-resizable>
            </div>
            <div  style="height:20vh; width:100%;z-index:2">
                <div v-if="isLoaded" class="grid">
                    <div style="width:60rem; height:40rem;" class="card" v-for="(lookmlFile, index) in lookmlFiles" :key="index">
                        <!-- <span>{{ file }}</span> -->
                        <CodeEditor style="width:100%; height:100%;" theme="github-dark" v-model="lookmlFiles[index]" :line-nums="true"/>
                    </div>
                </div>
                <div v-else id="code-container" class="card" style="height:100%">
                    <CodeEditor style="width:100%; height:100%;" theme="github-dark" v-model="data" :line-nums="true"/>
                </div>
            </div>
            <!-- <canvas id="canvas" style="position:absolute;width:100%;height:100%;z-index:1"></canvas> -->
        </foreignObject>
        </g>
        </svg>
        </div>
        </div>
    </div>
</template>

<style scoped>
svg:active {
    border:0px
}
.column-center {
    height:100%;
    width:100%;
    display:flex;
    flex-direction:column;
    align-items:center;
    align-content:center;
    z-index:1;
    position:relative;
;}
.row {
    display:flex;
    height:100%;
    width:100%;
    flex-direction:row;
}

.card {
    background: rgb(0,0,0,0.2);
    box-shadow: 0px 1px 10px 0px rgba(91,140,255,0.1),
0px 1px 20px -1px rgba(91,140,255,0.1);
    padding: 2rem;
    border-radius: 10px;
    margin-bottom: 1rem;
    margin-top: 2rem;
    width: 100px;
}

#zoom {
    height:100vh;
}
</style>