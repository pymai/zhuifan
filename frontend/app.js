// 确保Vue.js已加载
console.log('开始检查Vue.js...');
if (typeof Vue === 'undefined') {
    console.error('Vue.js未加载');
} else {
    console.log('Vue.js已加载，开始初始化应用');
    
    const { createApp } = Vue;

    const app = createApp({
        data() {
            return {
                currentView: 'list',
                animes: [],
                todayUpdates: [],
                adminView: 'manage',
                adminSearchQuery: '',
                adminStatusFilter: '',
                adminPlatformFilter: '',
                searchQuery: '',
                statusFilter: '',
                platformFilter: '',
                updateDayFilter: '',
                selectedDay: null,
                weekDays: [
                    { value: '周一', label: '周一' },
                    { value: '周二', label: '周二' },
                    { value: '周三', label: '周三' },
                    { value: '周四', label: '周四' },
                    { value: '周五', label: '周五' },
                    { value: '周六', label: '周六' },
                    { value: '周日', label: '周日' }
                ],
                form: {
                    title: '',
                    current_episode: 1,
                    total_episodes: null,
                    platform: '',
                    customPlatform: '',
                    platform_url: '',
                    status: '追番中',
                    notes: '',
                    update_day: ''
                },
                
                // 编辑弹窗相关
                showEditModal: false,
                editingAnimeId: null,
                editForm: {
                    title: '',
                    current_episode: 1,
                    total_episodes: null,
                    platform: '',
                    customPlatform: '',
                    platform_url: '',
                    status: '追番中',
                    notes: '',
                    update_day: ''
                },
                
                loading: false
            }
        },
        
        computed: {
            filteredAnimes() {
                let filtered = this.animes;
                
                // 按状态筛选
                if (this.statusFilter) {
                    filtered = filtered.filter(anime => anime.status === this.statusFilter);
                }
                
                // 按平台筛选
                if (this.platformFilter) {
                    filtered = filtered.filter(anime => anime.platform === this.platformFilter);
                }
                
                // 按更新日筛选
                if (this.updateDayFilter) {
                    filtered = filtered.filter(anime => anime.update_day === this.updateDayFilter);
                }
                
                // 按搜索关键词筛选
                if (this.searchQuery) {
                    const query = this.searchQuery.toLowerCase();
                    filtered = filtered.filter(anime => 
                        anime.title.toLowerCase().includes(query) ||
                        anime.platform.toLowerCase().includes(query) ||
                        (anime.notes && anime.notes.toLowerCase().includes(query))
                    );
                }
                
                return filtered;
            },
            
            filteredDayAnimes() {
                if (!this.selectedDay) return [];
                
                let filtered = this.getDayAnimes(this.selectedDay);
                
                // 按状态筛选
                if (this.statusFilter) {
                    filtered = filtered.filter(anime => anime.status === this.statusFilter);
                }
                
                // 按平台筛选
                if (this.platformFilter) {
                    filtered = filtered.filter(anime => anime.platform === this.platformFilter);
                }
                
                // 按搜索关键词筛选
                if (this.searchQuery) {
                    const query = this.searchQuery.toLowerCase();
                    filtered = filtered.filter(anime => 
                        anime.title.toLowerCase().includes(query) ||
                        anime.platform.toLowerCase().includes(query) ||
                        (anime.notes && anime.notes.toLowerCase().includes(query))
                    );
                }
                
                return filtered;
            },
            
            filteredAdminAnimes() {
                let filtered = this.animes;
                
                // 按状态筛选
                if (this.adminStatusFilter) {
                    filtered = filtered.filter(anime => anime.status === this.adminStatusFilter);
                }
                
                // 按平台筛选
                if (this.adminPlatformFilter) {
                    filtered = filtered.filter(anime => anime.platform === this.adminPlatformFilter);
                }
                
                // 按搜索关键词筛选
                if (this.adminSearchQuery) {
                    const query = this.adminSearchQuery.toLowerCase();
                    filtered = filtered.filter(anime => 
                        anime.title.toLowerCase().includes(query) ||
                        anime.platform.toLowerCase().includes(query) ||
                        (anime.notes && anime.notes.toLowerCase().includes(query))
                    );
                }
                
                return filtered;
            }
        },
        
        mounted() {
            console.log('Vue应用已挂载');
            console.log('初始showEditModal:', this.showEditModal);
            this.loadAnimes();
            this.loadTodayUpdates();
        },
        
        methods: {
            async loadAnimes() {
                try {
                    this.loading = true;
                    const response = await fetch('http://localhost:8000/api/animes');
                    if (response.ok) {
                        this.animes = await response.json();
                    } else {
                        console.error('加载动漫列表失败');
                    }
                } catch (error) {
                    console.error('网络错误:', error);
                } finally {
                    this.loading = false;
                }
            },
            
            async loadTodayUpdates() {
                try {
                    const response = await fetch('http://localhost:8000/api/animes/today');
                    if (response.ok) {
                        const data = await response.json();
                        this.todayUpdates = data.animes;
                    } else {
                        console.error('加载今日更新失败');
                    }
                } catch (error) {
                    console.error('网络错误:', error);
                }
            },
            
            async saveAnime() {
                try {
                    this.loading = true;
                    
                    // 处理自定义平台
                    const animeData = { ...this.form };
                    if (this.form.platform === '其他' && this.form.customPlatform) {
                        animeData.platform = this.form.customPlatform;
                    }
                    
                    // 确保platform_url字段被包含
                    animeData.platform_url = this.form.platform_url || '';
                    
                    const response = await fetch('http://localhost:8000/api/animes', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(animeData)
                    });
                    
                    if (response.ok) {
                        await this.loadAnimes();
                        await this.loadTodayUpdates();
                        this.resetForm();
                    } else {
                        console.error('保存失败');
                    }
                } catch (error) {
                    console.error('网络错误:', error);
                } finally {
                    this.loading = false;
                }
            },
            
            editAnime(anime) {
                this.editingAnimeId = anime.id;
                
                // 检查平台是否在预设列表中
                const presetPlatforms = ['腾讯视频', '爱奇艺', '哔哩哔哩', '优酷', '百度云盘', '阿里云盘', 'AGE动漫'];
                const isPresetPlatform = presetPlatforms.includes(anime.platform);
                
                // 使用Object.assign来确保响应式更新
                Object.assign(this.editForm, {
                    title: anime.title,
                    current_episode: anime.current_episode,
                    total_episodes: anime.total_episodes,
                    platform: isPresetPlatform ? anime.platform : '其他',
                    customPlatform: isPresetPlatform ? '' : anime.platform,
                    platform_url: anime.platform_url || '',
                    status: anime.status,
                    notes: anime.notes || '',
                    update_day: anime.update_day || ''
                });
                

                
                // 显示编辑弹窗
                this.showEditModal = true;
                
                // 手动显示弹窗
                const modal = document.getElementById('editModal');
                if (modal) {
                    modal.classList.remove('hidden');
                }
                
                // 强制更新DOM
                this.$nextTick(() => {
                    this.$forceUpdate();
                    
                                    // 手动设置表单字段值
                const modal = document.getElementById('editModal');
                if (modal) {
                    const inputs = modal.querySelectorAll('input, select, textarea');
                    inputs.forEach(input => {
                        const vModel = input.getAttribute('v-model');
                        
                        if (vModel === 'editForm.title') {
                            input.value = this.editForm.title;
                        } else if (vModel === 'editForm.platform') {
                            input.value = this.editForm.platform;
                        } else if (vModel === 'editForm.status') {
                            input.value = this.editForm.status;
                        } else if (vModel === 'editForm.update_day') {
                            input.value = this.editForm.update_day || '';
                        } else if (vModel === 'editForm.notes') {
                            input.value = this.editForm.notes || '';
                        } else if (vModel && vModel.includes('editForm.current_episode')) {
                            input.value = this.editForm.current_episode || '';
                        } else if (vModel && vModel.includes('editForm.total_episodes')) {
                            input.value = this.editForm.total_episodes || '';
                        } else if (vModel && vModel.includes('editForm.customPlatform')) {
                            input.value = this.editForm.customPlatform || '';
                        } else if (vModel === 'editForm.platform_url') {
                            input.value = this.editForm.platform_url || '';
                        }
                    });
                    
                    // 手动设置集数字段（因为v-model.number可能不保留在DOM中）
                    const numberInputs = modal.querySelectorAll('input[type="number"]');
                    numberInputs.forEach((input, index) => {
                        if (index === 0) {
                            // 第一个number输入是当前集数
                            input.value = this.editForm.current_episode || '';
                        } else if (index === 1) {
                            // 第二个number输入是总集数
                            input.value = this.editForm.total_episodes || '';
                        }
                    });
                    
                    // 手动添加事件监听器
                    const closeButtons = modal.querySelectorAll('button[type="button"]');
                    closeButtons.forEach(button => {
                        if (button.textContent.includes('取消') || button.querySelector('i.fa-times')) {
                            button.addEventListener('click', () => {
                                this.closeEditModal();
                            });
                        }
                    });
                    
                    // 添加右上角X按钮的事件监听器
                    const closeXButton = modal.querySelector('button i.fa-times').parentElement;
                    if (closeXButton) {
                        closeXButton.addEventListener('click', () => {
                            this.closeEditModal();
                        });
                    }
                    
                    // 添加更新按钮事件监听器
                    const updateButton = modal.querySelector('button[type="submit"]');
                    if (updateButton) {
                        updateButton.addEventListener('click', (e) => {
                            e.preventDefault();
                            this.updateAnime();
                        });
                    }
                    
                    // 添加点击背景关闭功能
                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) {
                            this.closeEditModal();
                        }
                    });
                }
                });
            },
            
            closeEditModal() {
                this.showEditModal = false;
                this.editingAnimeId = null;
                this.resetEditForm();
                
                // 手动隐藏弹窗
                const modal = document.getElementById('editModal');
                if (modal) {
                    modal.classList.add('hidden');
                }
            },
            
            resetEditForm() {
                this.editForm = {
                    title: '',
                    current_episode: 1,
                    total_episodes: null,
                    platform: '',
                    customPlatform: '',
                    platform_url: '',
                    status: '追番中',
                    notes: '',
                    update_day: ''
                };
            },
            
            async updateAnime() {
                try {
                    this.loading = true;
                    
                    // 从DOM同步数据到Vue.js
                    const modal = document.getElementById('editModal');
                    if (modal) {
                        const inputs = modal.querySelectorAll('input, select, textarea');
                        inputs.forEach(input => {
                            const vModel = input.getAttribute('v-model');
                            if (vModel === 'editForm.title') {
                                this.editForm.title = input.value;
                            } else if (vModel === 'editForm.platform') {
                                this.editForm.platform = input.value;
                            } else if (vModel === 'editForm.status') {
                                this.editForm.status = input.value;
                            } else if (vModel === 'editForm.update_day') {
                                this.editForm.update_day = input.value;
                            } else if (vModel === 'editForm.notes') {
                                this.editForm.notes = input.value;
                            } else if (vModel === 'editForm.platform_url') {
                                this.editForm.platform_url = input.value;
                            } else if (vModel && vModel.includes('editForm.current_episode')) {
                                this.editForm.current_episode = parseInt(input.value) || 0;
                            } else if (vModel && vModel.includes('editForm.total_episodes')) {
                                this.editForm.total_episodes = parseInt(input.value) || null;
                            } else if (vModel && vModel.includes('editForm.customPlatform')) {
                                this.editForm.customPlatform = input.value;
                            }
                        });
                        
                        // 同步number类型的输入
                        const numberInputs = modal.querySelectorAll('input[type="number"]');
                        numberInputs.forEach((input, index) => {
                            if (index === 0) {
                                this.editForm.current_episode = parseInt(input.value) || 0;
                            } else if (index === 1) {
                                this.editForm.total_episodes = parseInt(input.value) || null;
                            }
                        });
                    }
                    
                    // 处理自定义平台
                    const animeData = { ...this.editForm };
                    if (this.editForm.platform === '其他' && this.editForm.customPlatform) {
                        animeData.platform = this.editForm.customPlatform;
                    }
                    
                    // 确保platform_url字段被包含
                    animeData.platform_url = this.editForm.platform_url || '';
                    
                    const response = await fetch(`http://localhost:8000/api/animes/${this.editingAnimeId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(animeData)
                    });
                    
                    if (response.ok) {
                        await this.loadAnimes();
                        await this.loadTodayUpdates();
                        this.closeEditModal();
                        // 确保保持在管理后台的番剧列表页面
                        this.currentView = 'admin';
                        this.adminView = 'list';
                    } else {
                        console.error('更新失败');
                        const errorText = await response.text();
                        console.error('错误详情:', errorText);
                    }
                } catch (error) {
                    console.error('网络错误:', error);
                } finally {
                    this.loading = false;
                }
            },
            
            async deleteAnime(animeId) {
                if (!confirm('确定要删除这个动漫吗？')) {
                    return;
                }
                
                try {
                    this.loading = true;
                    const response = await fetch(`http://localhost:8000/api/animes/${animeId}`, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        await this.loadAnimes();
                        await this.loadTodayUpdates();
                    } else {
                        console.error('删除失败');
                    }
                } catch (error) {
                    console.error('网络错误:', error);
                } finally {
                    this.loading = false;
                }
            },
            
            resetForm() {
                this.form = {
                    title: '',
                    current_episode: 1,
                    total_episodes: null,
                    platform: '',
                    customPlatform: '',
                    platform_url: '',
                    status: '追番中',
                    notes: '',
                    update_day: ''
                };
            },
            
            getStatusClass(status) {
                const classes = {
                    '追番中': 'bg-green-100 text-green-800',
                    '已完结': 'bg-blue-100 text-blue-800',
                    '暂停': 'bg-yellow-100 text-yellow-800'
                };
                return classes[status] || 'bg-gray-100 text-gray-800';
            },
            
            goHome() {
                this.currentView = 'list';
                this.selectedDay = null;
                this.searchQuery = '';
                this.statusFilter = '';
                this.platformFilter = '';
                this.updateDayFilter = '';
            },
            
            selectDay(day) {
                this.selectedDay = this.selectedDay === day ? null : day;
                // 清除其他筛选条件
                this.updateDayFilter = '';
            },
            
            getDayAnimes(day) {
                return this.animes.filter(anime => anime.update_day === day);
            },
            
            getDayCount(day) {
                return this.getDayAnimes(day).length;
            },
            
            getDayLabel(day) {
                return day;
            },
            
            isTodayUpdate(updateDay) {
                if (!updateDay) return false;
                
                const today = new Date();
                const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
                const todayWeekday = weekdays[today.getDay()];
                
                return updateDay === todayWeekday;
            },
            
            formatDate(dateString) {
                const date = new Date(dateString);
                return date.toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        }
    });
    
    try {
        const mountedApp = app.mount('#app');
        console.log('Vue应用挂载成功:', mountedApp);
    } catch (error) {
        console.error('Vue应用挂载失败:', error);
    }
} 