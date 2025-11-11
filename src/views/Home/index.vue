<template>
    <div class="home-container">
        <div class="content-row">
            <Carousel class="carousel" :list="carouselList" />
            <Quanwei class="quanwei" />
        </div>
        <Category class="category" />
    </div>
</template>

<script lang="ts" setup>
import { getActiveCarouselsAPI } from '@/api/carousels';
import Carousel from '@/components/Carousel.vue';
import Category from '@/views/Home/components/Category.vue';
import Quanwei from '@/views/Home/components/Quanwei.vue';

const carouselList: any = ref([]);
const getCarousel = async () => {
    const res = await getActiveCarouselsAPI();
    carouselList.value = res.data.list.map((item: any) => ({
        id: item.article_id,
        title: item.title,
        image: item.cover_image,
    }));
};

onMounted(() => {
    getCarousel();
});
</script>

<style lang="scss" scoped>
.home-container {
    display: flex;
    flex-direction: column;
}

.content-row {
    display: flex;
    width: 1200px;
    margin: 0 auto;
    align-items: stretch;
}

.carousel {
    margin: 20px 0;
    margin-right: 20px;
    flex: 3;
    max-width: calc(1200px * (3 / 4));
    box-sizing: border-box;
}

.quanwei {
    margin: 20px 0;
    flex: 1;
    max-width: calc(1200px * (1 / 4));
    box-sizing: border-box;
}

.content {
    flex: 1;
    min-height: 900px;
    width: 1200px;
    margin: 0 auto;
}
</style>
