<template>
  <div class="theme-changer">
    <!-- 主题切换下拉菜单 -->
    <el-dropdown trigger="click" size="small" @command="handleCommand">
      <el-button type="primary" circle text>
        <i :class="themeIcon"></i>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item disabled class="dropdown-title"
            >主题模式</el-dropdown-item
          >
          <el-divider class="dropdown-divider" />
          <el-dropdown-item
            v-if="systemPreferenceSupported"
            command="system"
            :class="{ 'active-theme': followSystem }"
          >
            <i class="fas fa-desktop"></i> 跟随系统
          </el-dropdown-item>
          <el-dropdown-item
            command="light"
            :class="{ 'active-theme': !followSystem && theme === 'light' }"
          >
            <i class="fas fa-sun"></i> 浅色模式
          </el-dropdown-item>
          <el-dropdown-item
            command="dark"
            :class="{ 'active-theme': !followSystem && theme === 'dark' }"
          >
            <i class="fas fa-moon"></i> 深色模式
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script>
import { useTheme } from '@/composables/useTheme'
import { computed, ref } from 'vue'

export default {
  setup() {
    const {
      theme,
      systemTheme,
      followSystem,
      systemPreferenceSupported,
      setTheme,
      toggleFollowSystem,
    } = useTheme()

    const themeIcon = computed(() => {
      if (followSystem.value) {
        return 'fas fa-desktop'
      }
      return theme.value === 'dark' ? 'fas fa-moon' : 'fas fa-sun'
    })

    const handleCommand = (command) => {
      if (command === 'system') {
        toggleFollowSystem(true)
        return
      }
      setTheme(command)
    }

    return {
      theme,
      systemTheme,
      followSystem,
      systemPreferenceSupported,
      setTheme,
      toggleFollowSystem,
      themeIcon,
      handleCommand,
    }
  },
}
</script>

<style scoped>
.theme-changer {
  display: inline-flex;
  align-items: center;
}

:deep(.el-dropdown-menu__item.active-theme) {
  color: #fff;
  background-color: var(--el-color-primary);
}

:deep(.el-dropdown-menu__item.is-disabled) {
  cursor: not-allowed;
  opacity: 0.7;
}
:deep(.el-dropdown-menu__item.dropdown-title) {
  font-weight: bold;
  color: inherit;
  text-align: center;
  opacity: 1;
  cursor: default;
}
:deep(.dropdown-divider) {
  margin: 5px 0;
}
</style>
