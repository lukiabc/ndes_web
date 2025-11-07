<template>
    <div class="home-container">
        <div class="content-row">
            <Carousel class="carousel" />
            <Quanwei class="quanwei" />
        </div>
        <Category class="category" />
    </div>
</template>

<script lang="ts" setup>
import Carousel from '@/views/Home/components/Carousel.vue';
import Quanwei from '@/views/Home/components/Quanwei.vue';
import Category from '@/views/Home/components/Category.vue';
</script>

<style lang="scss" scoped>
.home-container {
    display: flex;
    flex-direction: column;
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
