import { Toolbar } from '@magic-scope/react';

// 最小工具栏:一排动作按钮 + 分隔 + 分组,整组只占一个 Tab 位,方向键在项间移焦。
export default function Demo() {
  return (
    <Toolbar aria-label="基础工具栏">
      <Toolbar.Button leftIcon="↶">撤销</Toolbar.Button>
      <Toolbar.Button leftIcon="↷">重做</Toolbar.Button>
      <Toolbar.Separator />
      <Toolbar.Group label="剪贴板">
        <Toolbar.Button>复制</Toolbar.Button>
        <Toolbar.Button>粘贴</Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.Link href="https://magic-scope.dev" target="_blank">
        帮助
      </Toolbar.Link>
    </Toolbar>
  );
}
