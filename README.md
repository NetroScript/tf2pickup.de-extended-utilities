# tf2pickup.de-extended-utilities

![image](https://user-images.githubusercontent.com/18115780/218281351-a7f6434a-c109-4e43-8f19-4d0d0137db7b.png)

This is a website for tracking the donations for the tf2pickup.de website.

It is directly integrated with Ko-Fi and will add donations to the main page, and additionally use a discord bot integration to send an embed to a selected channel.

Ko-Fi donations can be linked to Steam accounts (by putting in your Steam profile or Steam ID as first thing of the user provided message).

Later it is planned that users can use this to then "buy" small things with the money they donated, to motivate donations (say having an admin play medic for example).

The website has an additional (currently quite simple) admin interface, which allows to manually enter donations (should the website not have been online when a donation was made) and to also enter costs which running the website (and gameservers) have.

**Currently this is specifically made for the German website and almost all text is in German, and there is little information on how to get it running (besides the very basics). If there is any interest in hosting this for other pages of the tf2pickup.org community, just create an issue and when I have time I will improve documentation and maybe add localization already.**

## Developing

Once you've created a project and installed dependencies with `pnpm install`, start a development server:

```bash
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

## Building

To create a production version of your app:

```bash
pnpm run build
```

You can preview the production build with `pnpm run preview`.


## Deploying

An additional important note is, that the Ko-Fi donation endpoint by default is CSRF protected and the implementation of the Ko-Fi webhook (how they call it) would fail to an 403 error due to that.

This means when configuring in for example your Proxy, you will need to add the origin to that specific request before it arrives at the svelte-kit implementation.

The part of your configuration for NGINX could look like the following:

```apacheconf
  location /donation/kofi {
    # ... your other stuff
    proxy_set_header Origin 'https://donations.tf2pickup.de';
    # ... your other stuff
  }
```

### Used icons

See https://icones.js.org/collection/ph
