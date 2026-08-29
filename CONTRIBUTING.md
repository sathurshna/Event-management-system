# Contributing to Eventra

First off, thank you for considering contributing to Eventra! It's people like you that make Eventra such a great tool.

## 1. Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check our [Issues](../../issues) page to see if someone else in the community has already created a ticket. If not, go ahead and make one!

## 2. Fork & create a branch

If this is something you think you can fix, then fork Eventra and create a branch with a descriptive name.

A good branch name would be (where issue #325 is the ticket you're working on):

```
git checkout -b feature/325-add-calendar-export
```

## 3. Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for our commit messages. This allows us to automatically generate changelogs and version numbers.

Format:
`<type>[optional scope]: <description>`

Examples:
- `feat(web): add dark mode toggle`
- `fix(backend): resolve race condition in rsvp logic`
- `docs: update setup instructions in README`
- `test(api): add unit tests for user controller`

Allowed Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation

## 4. Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
3. Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent.
4. You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

## 5. Code Style

- We use `ESLint` and `Prettier` for our codebase.
- Before committing, ensure your code passes linting: `npm run lint`.
- For the frontend, stick to the custom glassmorphism CSS design system outlined in `index.css`. Avoid adding new ad-hoc styling unless absolutely necessary.

Thank you for contributing!
