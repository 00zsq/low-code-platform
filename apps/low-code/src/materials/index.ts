import type { ComponentDefinition } from '../types/editor';
import antdMaterials from './antd';
import basicMaterials from './basic';

// 导出所有物料
export const allMaterials: ComponentDefinition[] = [
  ...basicMaterials,
  ...antdMaterials,
];

// 按分类组织物料
export const materialsByCategory = allMaterials.reduce((acc, material) => {
  const { category } = material;
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push(material);
  return acc;
}, {} as Record<string, ComponentDefinition[]>);

// 物料查找
export const findMaterial = (type: string): ComponentDefinition | undefined => {
  return allMaterials.find(material => material.type === type);
};