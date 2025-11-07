<template>
    <div class="container">
        <div class="content">
            <div class="title-box">
                <span class="title">军事</span>
            </div>
            <div class="image-box">
                <img src="@/assets/images/login.png" alt="军事" />
            </div>
            <span class="image-title ellipsis">张游侠权威部长</span>
            <div class="list-box">
                <span class="title-list ellipsis">董军与塞尔维亚</span>
                <span class="title-list ellipsis">第 12 届东盟防长扩大会</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    width: 1000px;
    margin: 0 auto;
    font-size: 14px;
}

.title-box {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 2px solid #e0e0e0;
}

.title {
    padding: 8px 12px;
    font-size: 16px;
    color: #0056b3;
    font-weight: bold;
    border-bottom: 2px solid #0056b3;
    margin-bottom: -2px;
}

.image-box {
    margin-bottom: 10px;
}

.image-box img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 4px;
}

.list-box {
    display: flex;
    flex-direction: column;
    span {
        margin-top: 5px;
    }
}
</style>
