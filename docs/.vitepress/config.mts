import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/XBot-Documentation/',
  title: 'XBot Programming',
  description: 'FRC Programming Documentaton for Team 488',
  themeConfig: {
    logo: { src: '/xbot-logo.png', width: 24, height: 24 },
    nav: [
      { text: 'Curriculum', link: '/curriculum/' },
      { text: 'Examples', link: '/examples/' },
      { text: 'Tooling', link: '/tooling/' },
    ],
    sidebar: {
      '/curriculum/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Overview', link: '/curriculum/' },
            { text: 'Environment Setup', link: '/curriculum/01-environment-setup' },
            { text: 'Java Basics', link: '/curriculum/02-java-basics' },
            { text: 'Git & GitHub', link: '/curriculum/03-git-github' },
          ],
        },
        {
          text: 'Robot Fundamentals',
          items: [
            { text: 'Robot Architecture', link: '/curriculum/04-robot-architecture' },
            { text: 'Electrical Contract', link: '/curriculum/05-electrical-contract' },
            { text: 'Motor Control', link: '/curriculum/06-motor-control' },
            { text: 'PID Logic', link: '/curriculum/07-pid-logic' },
          ],
        },
        {
          text: 'XBot Patterns',
          items: [
            { text: 'Dependency Injection', link: '/curriculum/08-dependency-injection' },
            { text: 'Providers & Factories', link: '/curriculum/09-providers-factories' },
            { text: 'Command-Based Programming', link: '/curriculum/10-command-based' },
            { text: 'Maintainers', link: '/curriculum/11-maintainers' },
            { text: 'Swerve Drive', link: '/curriculum/12-swerve-drive' },
            { text: 'Properties & Tuning', link: '/curriculum/13-properties-tuning' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Code Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Elevator Logic', link: '/examples/elevator-logic' },
            { text: 'Swerve Drive Command', link: '/examples/swerve-drive-command' },
            { text: 'Simple Motor Subsystem', link: '/examples/simple-motor' },
            { text: 'Maintainer Pattern', link: '/examples/maintainer-pattern' },
          ],
        },
      ],
  '/tooling/': [
        {
          text: 'Tools & Setup',
          items: [
        { text: 'Overview', link: '/tooling/' },
            { text: 'WPILib Overview', link: '/tooling/wpilib-overview' },
            { text: 'PathPlanner', link: '/tooling/pathplanner' },
            { text: 'Phoenix Tuner', link: '/tooling/phoenix-tuner' },
            { text: 'VSCode Keybinds', link: '/tooling/vscode-keybinds' },
            { text: 'Gradle Commands', link: '/tooling/gradle-commands' },
            { text: 'AdvantageScope', link: '/tooling/advantagescope' },
            { text: 'QDriverStation', link: '/tooling/qdriverstation' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Team488' },
    ],
    editLink: {
      pattern: 'https://github.com/Team488/XBot-Documentation/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
    footer: {
      message: 'Built for XBot Robotics Team 488',
      copyright: 'FRC FIRST Robotics',
    },
  },
})
