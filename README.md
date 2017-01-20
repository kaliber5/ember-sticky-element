# ember-sticky-element

[![Build Status](https://travis-ci.org/kaliber5/ember-sticky-element.svg?branch=master)](https://travis-ci.org/simonihmig/ember-sticky-element)


This Ember addon gives you the ability to make parts of your UI stick to the viewport when scrolling. 
Its semantics follow roughly the proposed [`position: sticky`](https://drafts.csswg.org/css-position/#sticky-pos) specs.

## Why should I use this

The mentioned CSS extension of `position: sticky` is still in a draft stage, and 
[not widely supported](http://caniuse.com/#feat=css-sticky) natively. While there are polyfills available, they lack
some features:
* you cannot change the styling of your sticky element based on its state of being sticky or not
* you cannot dynamically change the contents of the sticky element based on that state either

While there a probably a few jQuery plugins around for the same purpose, they might not always play well with Ember. 

So this addon adds a `sticky-element` component, that mimics the basic `position: sticky` behaviour.
Currently it only supports scrolling in the vertical direction, not horizontal stickiness yet. 

It leverages [ember-in-viewport](https://github.com/DockYard/ember-in-viewport) under the hood for its efficient 
viewport detection techniques.

## How to use this

### Installation

```bash
ember install ember-sticky-element
```

### Basic usage

Just wrap your content into the `sticky-element`:

```hbs
{{#sticky-element}}
  <h2>Sticky Element</h2>
{{/sticky-element}}
```

This will make it flow with the other content when scrolling until it reaches the top of the viewport, at which point
it will get sticky. This effectively makes it `position: fixed`. *(Unfortunately for now this will require you to allow
inline styles if you use CSP!)*

## Customization options

### Offsets

#### Top offset

Add the `top` property to specify an offset in pixels from the top of the viewport:

```hbs
{{#sticky-element top=50}}
  <h2>Sticky Element</h2>
{{/sticky-element}}
```

#### Bottom offset

By default the sticky element will not care about its parent enclosing element and just remain sticky to the top when 
scrolling the page all the way down. To make it also stick to the bottom of its parent (so it does not leave its parent's
boundaries), just add the `bottom` property, with a value of 0 or some other offset:

```hbs
{{#sticky-element top=50 bottom=0}}
  <h2>Sticky Element</h2>
{{/sticky-element}}
```

Make sure that the parent element has some positioning applied, so at least `position: relative`, as sticking to the 
bottom is done by applying `position: absolute` to the sticky element!


### Styling

#### CSS

The sticky element has a `sticky-element` class you can use for styling. Furthermore it adds some additional classes
when being sticky:
* `sticky-element--sticky` (either to the top or the bottom)
* `sticky-element--sticky-top`
* `sticky-element--sticky-bottom`

#### Content

The component yields a hash, that contains the following boolean properties based on its state:
* `isSticky`
* `isStickyTop`
* `isStickyBottom`

You can use these to change the content of the sticky element based on its state:

```hbs
{{#sticky-element as |state|}}
  <h2>Sticky Element</h2>
  <p>{{#if state.isSticky}}Yeah, I am sticky!{{else}}I am just a normal element.{{/if}}</p>
{{/sticky-element}}
```