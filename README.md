# Surfinn Cli

이 프로젝트는 아직 개발 중입니다.

Surfinn Cli는 React Native를 위한 보일러플레이트 ignite-cli를 수정하여 React App을 위한 보일러플레이트 및 cli를 제공하도록 하였습니다.
함께 배포하는 template에는 다음의 기술 스택을 포함하고 있습니다.

- react
- react-dom
- mobx
- mobx-react-lite
- mobx-state-tree
- apisauce
- ...

## 프로젝트 생성 
기본 템플릿은 `surfinn-template-ts-mui`입니다. 추후 다른 템플릿을 제공 예정입니다.

```sh
npx surfinn-cli new MyAwesomeApp

cd MyAwesomeApp
yarn start
```

## 제너레이터

serfinn generator는 `component`, `model`, `store`, `service` 등을 제공합니다.
서브디렉토리를 지정하면 관련 그룹으로 구분하여 생성할 수 있습니다. 서브디렉토리의 깊이는 제한이 없습니다.

```sh
yarn gen component [subdirectory/]my-comp
yarn gen model [subdirectory/]user
yarn gen service [subdirectory/]user
yarn gen model [subdirectory/]user --store
```

