const INFO: string[] = [
  '同学你好！如果你看到了这条信息，也许你对这个平台是怎么搭建的感兴趣。',
  '你可以前往以下链接查看平台前端、后端的完整源码。',
  '后端： https://github.com/bjut-tech/su-appeal',
  '前端： https://github.com/bjut-tech/su-appeal-frontend',
  '如果发现了任何问题，欢迎提交 issue；如果有兴趣贡献代码，欢迎提交 pull request！'
]

export const showConsoleInfo = (): void => {
  console.log('%c' + INFO.join('\n'), 'color: #3b82f6; font-size: 10px;')
}
