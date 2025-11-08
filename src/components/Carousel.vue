<!-- 轮播图 -->
<template>
    <div class="home-carousel">
        <el-carousel height="400px" indicator-position="none">
            <el-carousel-item
                v-for="item in list"
                :key="item.id"
                @mouseenter="showTitle(item.id)"
                @mouseleave="hideTitle(item.id)"
            >
                <router-link :to="`/article/${item.id}`">
                    <img :src="item.image" alt="" class="carousel-image" />
                </router-link>
                <div class="carousel-title" v-show="hoveredId === item.id">
                    {{ item.title }}
                </div>
            </el-carousel-item>
        </el-carousel>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
    list: {
        id: number;
        title: string;
        image: string;
    }[];
}>();

const hoveredId = ref(0);

const showTitle = (id: number) => {
    hoveredId.value = id;
};

const hideTitle = (id: number) => {
    if (hoveredId.value === id) {
        hoveredId.value = 0;
    }
};
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
