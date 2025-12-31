// ========================================
// ヘッダー機能 - 本家ドコモ仕様
// ========================================

// ヘッダースクロール効果
class HeaderScroll {
    constructor() {
        this.header = document.querySelector('.header');
        this.lastScroll = 0;
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 50) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }

            this.lastScroll = currentScroll;
        });
    }
}

// 検索パネル
class SearchPanel {
    constructor() {
        this.searchToggle = document.getElementById('searchToggle');
        this.searchPanel = document.getElementById('searchPanel');
        this.searchClose = document.getElementById('searchClose');
        this.searchInput = document.querySelector('.search-input');

        if (this.searchToggle && this.searchPanel) {
            this.init();
        }
    }

    init() {
        this.searchToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.open();
        });

        this.searchClose.addEventListener('click', () => {
            this.close();
        });

        // パネル外クリックで閉じる
        document.addEventListener('click', (e) => {
            if (this.searchPanel.classList.contains('active') &&
                !this.searchPanel.contains(e.target) &&
                !this.searchToggle.contains(e.target)) {
                this.close();
            }
        });

        // ESCキーで閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.searchPanel.classList.contains('active')) {
                this.close();
            }
        });
    }

    open() {
        this.searchPanel.classList.add('active');
        setTimeout(() => {
            this.searchInput.focus();
        }, 300);
    }

    close() {
        this.searchPanel.classList.remove('active');
        this.searchInput.value = '';
    }
}

// ドロップダウンメニュー
class DropdownMenu {
    constructor() {
        this.navItems = document.querySelectorAll('.nav-item.has-dropdown');
        this.init();
    }

    init() {
        this.navItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            const dropdown = item.querySelector('.dropdown-menu');
            let timeout;

            // マウスエンター
            item.addEventListener('mouseenter', () => {
                clearTimeout(timeout);
                item.classList.add('active');

                // 他のドロップダウンを閉じる
                this.navItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
            });

            // マウスリーブ
            item.addEventListener('mouseleave', () => {
                timeout = setTimeout(() => {
                    item.classList.remove('active');
                }, 200);
            });

            // タッチデバイス対応
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 900) {
                    e.preventDefault();
                    item.classList.toggle('active');
                }
            });
        });

        // ドロップダウン外をクリックで閉じる
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-item')) {
                this.navItems.forEach(item => {
                    item.classList.remove('active');
                });
            }
        });
    }
}

// トップバーリンクアニメーション
class TopbarAnimation {
    constructor() {
        this.links = document.querySelectorAll('.topbar-link');
        this.init();
    }

    init() {
        this.links.forEach(link => {
            link.addEventListener('mouseenter', (e) => {
                this.animateIcon(e.currentTarget);
            });
        });
    }

    animateIcon(link) {
        const icon = link.querySelector('.topbar-icon');
        if (icon) {
            icon.style.animation = 'none';
            setTimeout(() => {
                icon.style.animation = 'iconBounce 0.5s ease';
            }, 10);
        }
    }
}

// ナビゲーションリンクグローエフェクト
class NavLinkGlow {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        this.navLinks.forEach(link => {
            link.addEventListener('mouseenter', function() {
                this.style.boxShadow = '0 4px 12px rgba(44, 79, 141, 0.2)';
            });

            link.addEventListener('mouseleave', function() {
                this.style.boxShadow = '';
            });
        });
    }
}

// カルーセル機能
class Carousel {
    constructor() {
        this.track = document.getElementById('carouselTrack');
        this.slides = document.querySelectorAll('.carousel-slide');
        this.prevBtn = document.getElementById('carouselPrev');
        this.nextBtn = document.getElementById('carouselNext');
        this.pauseBtn = document.getElementById('carouselPause');
        this.indicatorsContainer = document.getElementById('carouselIndicators');

        this.currentSlide = 0;
        this.isPlaying = true;
        this.interval = null;

        this.init();
    }

    init() {
        // インジケーターを作成
        this.createIndicators();

        // イベントリスナーを設定
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        this.pauseBtn.addEventListener('click', () => this.togglePlay());

        // 自動再生を開始
        this.startAutoPlay();
    }

    createIndicators() {
        this.slides.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.classList.add('carousel-indicator');
            if (index === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => this.goToSlide(index));
            this.indicatorsContainer.appendChild(indicator);
        });
        this.indicators = document.querySelectorAll('.carousel-indicator');
    }

    goToSlide(index) {
        // 現在のスライドを非アクティブに
        this.slides[this.currentSlide].classList.remove('active');
        this.indicators[this.currentSlide].classList.remove('active');

        // 新しいスライドをアクティブに
        this.currentSlide = index;
        this.slides[this.currentSlide].classList.add('active');
        this.indicators[this.currentSlide].classList.add('active');

        // トラックを移動
        const offset = -this.currentSlide * 100;
        this.track.style.transform = `translateX(${offset}%)`;
    }

    nextSlide() {
        const next = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(next);
    }

    prevSlide() {
        const prev = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prev);
    }

    startAutoPlay() {
        this.interval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    stopAutoPlay() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    togglePlay() {
        if (this.isPlaying) {
            this.stopAutoPlay();
            this.pauseBtn.textContent = '再生';
            this.isPlaying = false;
        } else {
            this.startAutoPlay();
            this.pauseBtn.textContent = '一時停止';
            this.isPlaying = true;
        }
    }
}

// タブ機能
class Tabs {
    constructor() {
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel');

        this.init();
    }

    init() {
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                this.switchTab(targetTab, button);
            });
        });
    }

    switchTab(targetTab, button) {
        // すべてのタブボタンとパネルを非アクティブに
        this.tabButtons.forEach(btn => btn.classList.remove('active'));
        this.tabPanels.forEach(panel => panel.classList.remove('active'));

        // 選択されたタブをアクティブに
        button.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
    }
}

// メニュートグル
class MenuToggle {
    constructor() {
        this.menuToggle = document.getElementById('menuToggle');
        this.headerNav = document.querySelector('.header-nav');
        this.headerActions = document.querySelector('.header-actions');
        this.isOpen = false;

        this.init();
    }

    init() {
        this.menuToggle.addEventListener('click', () => {
            this.toggle();
        });
    }

    toggle() {
        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            this.menuToggle.classList.add('active');
            // モバイルメニューの実装（簡易版）
            console.log('Menu opened');
        } else {
            this.menuToggle.classList.remove('active');
            console.log('Menu closed');
        }
    }
}

// スムーズスクロール
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }
}

// インタラクティブアニメーション
class AnimationObserver {
    constructor() {
        this.init();
    }

    init() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeIn 0.8s ease-out';
                    entry.target.style.opacity = '1';
                }
            });
        }, observerOptions);

        // アニメーション対象の要素を監視
        document.querySelectorAll('.service-item, .purpose-item, .tab-card').forEach(el => {
            el.style.opacity = '0';
            observer.observe(el);
        });
    }
}

// カードホバーエフェクト
class CardEffects {
    constructor() {
        this.init();
    }

    init() {
        const cards = document.querySelectorAll('.service-item, .purpose-item, .tab-card');

        cards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                this.addGlow(e.target);
            });

            card.addEventListener('mouseleave', (e) => {
                this.removeGlow(e.target);
            });
        });
    }

    addGlow(element) {
        element.style.transition = 'all 0.3s ease';
        element.style.boxShadow = '0 10px 30px rgba(44, 79, 141, 0.3)';
    }

    removeGlow(element) {
        element.style.boxShadow = '';
    }
}

// パララックス効果（簡易版）
class ParallaxEffect {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.carousel-section');

            parallaxElements.forEach(el => {
                const speed = 0.5;
                el.style.backgroundPositionY = `${scrolled * speed}px`;
            });
        });
    }
}

// ページ読み込み時のローディングアニメーション
class PageLoader {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('load', () => {
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.5s';

            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 100);
        });
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    // ヘッダー機能を初期化
    new HeaderScroll();
    new DropdownMenu();
    new NavLinkGlow();

    // その他の機能を初期化
    new Carousel();
    new Tabs();
    new MenuToggle();
    new SmoothScroll();
    new AnimationObserver();
    new CardEffects();
    new ParallaxEffect();
    new PageLoader();

    console.log('ドコモクローンサイト（本家仕様・1階層ヘッダー）が初期化されました');
});
