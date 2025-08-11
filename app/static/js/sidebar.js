class SidebarController {
                constructor() {
                    this.isExpanded = false;
                    this.init();
                }

                init() {
                    const toggleBtn = document.getElementById('sb-toggle');
                    const sideslider = document.querySelector('.sideslider');

                    // Ocultar sideslider por defecto
                    if (sideslider) {
                        sideslider.style.transform = 'translateX(-10%)';
                        sideslider.style.opacity = '0';
                        sideslider.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                    }

                    toggleBtn?.addEventListener('click', this.toggleSidebar.bind(this));
                }

                toggleSidebar() {
                    this.isExpanded = !this.isExpanded;
                    const sideslider = document.querySelector('.sideslider');

                    if (this.isExpanded) {
                        // Mostrar sideslider deslizándolo
                        if (sideslider) {
                            sideslider.style.transform = 'translateX(0)';
                            sideslider.style.opacity = '1';
                        }
                    } else {
                        // Ocultar sideslider deslizándolo
                        if (sideslider) {
                            sideslider.style.transform = 'translateX(-10%)';
                            sideslider.style.opacity = '0';
                        }
                    }
                }
            }

            document.addEventListener('DOMContentLoaded', () => {
                new SidebarController();
            });