<template>
  <div style="padding: 20px">
    <h3>TagSelector 组件测试</h3>

    <div style="margin-bottom: 20px">
      <h4>普通模式（不可排序）</h4>
      <TagSelector
        v-model="selectedTags1"
        v-model:tagList="tagList1"
        :width="'300px'"
        :addNew="true"
        placeholder="选择标签（不可排序）"
      />
      <p>选中的标签: {{ selectedTags1 }}</p>
    </div>

    <div style="margin-bottom: 20px">
      <h4>可排序模式</h4>
      <TagSelector
        v-model="selectedTags2"
        v-model:tagList="tagList2"
        :width="'300px'"
        :addNew="true"
        :sortable="true"
        placeholder="选择标签（可排序）"
      />
      <p>选中的标签: {{ selectedTags2 }}</p>
    </div>

    <div style="margin-bottom: 20px">
      <h4>DraggableSelector 组件测试</h4>
      <DraggableSelector
        v-model="testValues"
        :options="testOptions"
        :width="'300px'"
        placeholder="拖拽排序测试"
        value-key="value"
        label-key="label"
      />
      <p>当前值: {{ testValues }}</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import TagSelector from '@/components/TagSelector.vue'
import DraggableSelector from '@/components/DraggableSelector.vue'

export default {
  components: {
    TagSelector,
    DraggableSelector
  },
  setup() {
    // TagSelector 测试数据
    const selectedTags1 = ref([])
    const tagList1 = ref([
      { _id: 'tag1', tagname: 'Vue.js' },
      { _id: 'tag2', tagname: 'JavaScript' },
      { _id: 'tag3', tagname: 'Element Plus' },
      { _id: 'tag4', tagname: 'Node.js' },
      { _id: 'tag5', tagname: 'CSS' }
    ])

    const selectedTags2 = ref([])
    const tagList2 = ref([
      { _id: 'tag1', tagname: 'Vue.js' },
      { _id: 'tag2', tagname: 'JavaScript' },
      { _id: 'tag3', tagname: 'Element Plus' },
      { _id: 'tag4', tagname: 'Node.js' },
      { _id: 'tag5', tagname: 'CSS' },
      { _id: 'tag6', tagname: 'TypeScript' },
      { _id: 'tag7', tagname: 'React' }
    ])

    // DraggableSelector 测试数据
    const testValues = ref(['option1', 'option2', 'option3'])
    const testOptions = ref([
      { value: 'option1', label: '选项1' },
      { value: 'option2', label: '选项2' },
      { value: 'option3', label: '选项3' },
      { value: 'option4', label: '选项4' },
      { value: 'option5', label: '选项5' }
    ])

    return {
      selectedTags1,
      tagList1,
      selectedTags2,
      tagList2,
      testValues,
      testOptions
    }
  }
}
</script>
