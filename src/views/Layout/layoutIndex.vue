<template>
    <div class="page-container">
        <Header />
        <div class="content">
            <router-view />
        </div>
        <Footer />
    </div>
</template>

<script lang="ts" setup>
import Header from '@/views/Layout/components/Header.vue';
import Footer from '@/views/Layout/components/Footer.vue';
</script>

<style lang="scss" scoped>
.page-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    background-color: #fff;
}

.content {
    flex: 1;
    width: 1000px;
    margin: 0 auto;
    box-sizing: border-box;
}
</style>
