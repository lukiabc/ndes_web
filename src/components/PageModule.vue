<!-- 分页模板 -->
<template>
    <div>
        <div class="pagination">
            <button
                class="page-item"
                :class="{ disabled: pageObj.pageIndex == 1 }"
                :disabled="pageObj.pageIndex === 1"
                @click="lastPage"
            >
                &laquo;
            </button>
            <span
                class="page-item"
                :class="{ active: num == pageObj.pageIndex }"
                @click="gotoPage(num)"
                v-for="num in totalPage"
                :key="num"
                >{{ num }}</span
            >
            <button
                class="page-item"
                @click="nextPage"
                :class="{ disabled: pageObj.pageIndex == totalPage }"
                :disabled="pageObj.pageIndex === totalPage"
            >
                &raquo;
            </button>
        </div>
    </div>
</template>

<script>
export default {
    props: ['pageObj'],
    components: {},
    data() {
        return {};
    },
    methods: {
        gotoPage(num) {
            if (num >= 1 || num <= this.totalPage) {
                this.pageObj.pageIndex = num;
                console.log('当前页:', this.pageObj.pageIndex);
                this.$emit('send', this.pageObj.pageIndex);
            }
        },
        lastPage() {
            if (this.pageObj.pageIndex > 1) {
                this.pageObj.pageIndex--;
                console.log('上一页:', this.pageObj.pageIndex);
                this.$emit('send', this.pageObj.pageIndex);
            }
        },
        nextPage() {
            if (this.pageObj.pageIndex < this.totalPage) {
                this.pageObj.pageIndex++;
                console.log('下一页：', this.pageObj.pageIndex);
                this.$emit('send', this.pageObj.pageIndex);
            }
        },
    },
    computed: {
        totalPage() {
            return Math.ceil(this.pageObj.total / this.pageObj.pageSize);
        },
    },
    mounted() {},
};
</script>

<style lang="scss" scoped>
/* 分页区域 */
.pagination {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    font-size: 14px;
    color: #555;
}

.page-item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1px solid #ddd;
    background-color: #fff;
    color: #4a90e2;
    font-size: 16px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.page-item.disabled {
    cursor: not-allowed;
    color: #ccc;
    opacity: 0.7;
}

/* 当前页码文本 */
.page-item.active {
    background-color: #4a90e2;
    color: white;
    font-weight: 500;
}

/* 上一页、下一页箭头按钮 */
.page-item:first-child,
.page-item:last-child {
    font-weight: bold;
    color: #555;
}

.page-item:first-child:hover,
.page-item:last-child:hover {
    background-color: #4a90e2;
    color: white;
}
</style>
