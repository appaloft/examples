# Oneclick

Tiny Docker-backed HTTP app used to demonstrate Appaloft **one-click Blueprint** deploy.

[![Deploy on Appaloft](https://appaloft.com/badge/deploy.svg)](https://app.appaloft.com/deploy?source=blueprint&blueprintUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fappaloft%2Fexamples%2Fmain%2Foneclick%2Fappaloft.blueprint.yaml&blueprintTitle=Oneclick&blueprintProfile=production&step=project&projectMode=new&projectName=Oneclick)

The button hands Appaloft Cloud a remote `appaloft.blueprint.yaml` from this directory. The deployable topology stays in the Blueprint; the badge is only the handoff.

This folder lives in the unified public examples monorepo:

```text
https://github.com/appaloft/examples/tree/main/oneclick
```

## Run locally

```sh
npm ci
npm start
# open http://127.0.0.1:3000
```

## Docker

```sh
docker build -t appaloft-example-oneclick .
docker run --rm -p 3000:3000 appaloft-example-oneclick
```

## Blueprint URL

```text
https://raw.githubusercontent.com/appaloft/examples/main/oneclick/appaloft.blueprint.yaml
```

Cloud resolves the Git source as `appaloft/examples` with `baseDirectory=/oneclick` from that URL path.
