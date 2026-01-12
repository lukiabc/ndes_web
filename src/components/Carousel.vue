<!-- 轮播图组件 -->
<template>
    <div class="home-carousel">
        <el-carousel height="400px" indicator-position="none">
            <el-carousel-item
                v-for="item in list"
                :key="item.id"
                @mouseenter="showTitle(item.id)"
                @mouseleave="hideTitle(item.id)"
                class="carousel-item"
            >
                <router-link :to="`/article/${item.id}`" target="_blank">
                    <img
                        v-if="item.image"
                        :src="item.image"
                        alt=""
                        class="carousel-image"
                    />
                    <img
                        v-else
                        src="@/assets/images/login.png"
                        alt="默认图"
                        class="carousel-image"
                    />
                </router-link>
                <div class="carousel-title" v-show="hoveredId === item.id">
                    {{ item.title }}
                </div>
            </el-carousel-item>
        </el-carousel>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const props = defineProps<{
    list: {
        id: number;
        title: string;
        image: string;
    }[];
}>();

const hoveredId = ref(0);

// 鼠标进入轮播项时显示标题
const showTitle = (id: number) => {
    hoveredId.value = id;
};

// 鼠标离开轮播项时隐藏标题
const hideTitle = (id: number) => {
    if (hoveredId.value === id) {
        hoveredId.value = 0;
    }
};
</script>

<style lang="scss" scoped>
.home-carousel {
    width: 1200px;
    height: 400px;
    margin: 0 auto;

    .carousel-item {
        background-color: #a30800;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .carousel-image {
        max-height: 100%;
        max-width: 100%;
        object-fit: contain;
    }

    .carousel-title {
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
