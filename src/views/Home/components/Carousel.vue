<!-- 轮播图 -->
<template>
    <div class="home-carousel">
        <el-carousel height="400px" indicator-position="none">
            <el-carousel-item
                v-for="item in carouselList"
                :key="item.carousel_id"
                @mouseenter="showTitle(item.carousel_id)"
                @mouseleave="hideTitle(item.carousel_id)"
            >
                <router-link :to="`/article/${item.article_id}`">
                    <img
                        :src="item.cover_image"
                        alt=""
                        class="carousel-image"
                    />
                </router-link>
                <div
                    class="carousel-title"
                    v-show="hoveredId === item.carousel_id"
                >
                    {{ item.title }}
                </div>
            </el-carousel-item>
        </el-carousel>
    </div>
</template>

<script lang="ts" setup>
import { getActiveCarouselsAPI } from '@/api/carousels';

const hoveredId = ref(0);

const carouselList: any = ref([]);
const getCarousel = async () => {
    const res = await getActiveCarouselsAPI();
    console.log(res.data.list, '轮播图数据');

    carouselList.value = res.data.list;
};

const showTitle = (id: number) => {
    hoveredId.value = id;
};

const hideTitle = (id: number) => {
    if (hoveredId.value === id) {
        hoveredId.value = 0;
    }
};

onMounted(() => {
    getCarousel();
});
</script>

<style lang="scss" scoped>
.home-carousel {
    width: 1000px;
    height: 400px;
    margin: 0 auto;

    .carousel-image {
        width: 100%;
        height: 400px;
    }

    .carousel-title {
        width: 100%;
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        background-color: rgba(0, 0, 0, 0.5);
        padding: 5px 10px;
        border-radius: 5px;
        color: white;
        font-size: 16px;
        z-index: 10;
    }
}
</style>
