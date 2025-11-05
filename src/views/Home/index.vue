<template>
    <div class="page-container">
        <Header />
        <div class="content-row">
            <Carousel class="carousel" />
            <Quanwei class="quanwei" />
        </div>
        <main class="content">
            <router-view />
        </main>
        <Footer />
    </div>
</template>

<script lang="ts" setup>
import Carousel from '@/views/Home/components/Carousel.vue';
import Footer from '@/views/Home/components/Footer.vue';
import Header from '@/views/Home/components/Header.vue';
import Quanwei from '@/views/Home/components/Quanwei.vue';
</script>

<style lang="scss" scoped>
.page-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    background-color: #f5f7fa;
}

.content-row {
    display: flex;
    width: 1000px;
    margin: 0 auto;
    align-items: stretch;
}

.carousel {
    margin: 20px 0;
    margin-right: 20px;
    flex: 2;
    max-width: calc(1000px * (2 / 3));
    box-sizing: border-box;
}

.quanwei {
    margin: 20px 0;
    flex: 1;
    max-width: calc(1000px * (1 / 3));
    box-sizing: border-box;
}

.content {
    flex: 1;
    min-height: 900px;
    width: 1000px;
    margin: 0 auto;
}
</style>
