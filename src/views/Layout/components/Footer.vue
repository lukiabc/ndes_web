<template>
    <footer class="footer-content">
        <div class="support-organ">
            <div class="main">
                <div class="support-organ-main">
                    <div class="title" style="position: relative">
                        友情链接
                        <strong style="color: rgb(39, 99, 206); font-size: 15px"
                            >》</strong
                        >
                        <b
                            style="
                                width: 1112px;
                                height: 1px;
                                background: rgb(204, 204, 204);
                                position: absolute;
                                top: 17px;
                                left: 90px;
                            "
                        ></b>
                    </div>
                    <div class="link-list">
                        <a
                            href="http://www.mva.gov.cn/"
                            target="_blank"
                            class="link-item"
                        >
                            中华人民共和国退役军人事务部
                        </a>
                        <span class="separator"> | </span>
                        <a
                            href="http://www.mohrss.gov.cn/"
                            target="_blank"
                            class="link-item"
                        >
                            中华人民共和国人力资源和社会保障部
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div class="copyright-section">
            <div class="main">
                <div class="copyright-main">
                    <div class="copyright-left">
                        <p>运营机构：中国国防教育网</p>
                        <p>监督电话：010-00000000</p>
                        <p>运营地点：12345689</p>
                        <p>
                            Copyright © 中国国防教育网. 中国. All Rights
                            Reserved.
                        </p>
                    </div>
                    <div class="copyright-right">
                        <p>技术支持：军合（北京）国际文化产业有限公司</p>
                        <p>意见反馈：junhegfjyw@163.com</p>
                        <p>
                            <a
                                href="https://beian.mps.gov.cn/#/query/webSearch?code="
                                target="_blank"
                                rel="noopener noreferrer"
                                class="footer-link"
                            >
                                公安备案
                            </a>
                            &nbsp;|&nbsp; 工信备案：
                            <a
                                href="https://beian.miit.gov.cn/#/Integrated/index"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="footer-link"
                            >
                                京ICP备2024081073号-1
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </footer>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.footer-content {
    margin: 40px 0;
    width: 100%;
    color: #fff;
    line-height: 30px;
    font-size: 14px;
}

.support-organ,
.copyright-section {
    width: 100%;
    background: #f9f9f9;
    border-top: 1px solid #e9e9e9;
}

.main {
    width: 1000px;
    margin: 0 auto;
    font-size: 13px;
    clear: both;
    position: relative;
}

.support-organ-main {
    padding: 20px 0;
}

.support-organ-main .title {
    color: #323232;
    font-size: 18px;
    position: relative;
}

.link-list {
    margin-left: 20px;
    margin-top: 10px;
    color: #323232;
    font-size: 14px;
    line-height: 1.8;
}

.link-item {
    color: #323232;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
        color: #0066cc;
        text-decoration: underline;
    }
}

.separator {
    color: #999;
    font-size: 14px;
}

.copyright-main {
    padding: 10px 0;
    color: #323232;
    font-size: 14px;
    line-height: 1.8;
    display: flex;
    justify-content: space-between;
    gap: 20px;
}

.copyright-left,
.copyright-right {
    flex: 1;
    min-width: 200px;
}

.copyright-left p,
.copyright-right p {
    margin: 8px 0;
}

.footer-link {
    color: #323232;
    text-decoration: underline;
    transition: color 0.3s ease;

    &:hover {
        color: #0066cc;
    }
}

@media (max-width: 768px) {
    .copyright-main {
        flex-direction: column;
        text-align: center;
        gap: 16px;
    }

    .copyright-right {
        text-align: center;
    }
}
</style>
