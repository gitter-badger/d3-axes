import { gup } from 'd3-gup';
import { compose } from 'd3-compose';
import { compose as scaler } from './scaler';

let count = 0;

export function shape(path) {
  let index = count++
    , id = null
    , call = gup()
        .exit($ => $.remove())
        .enter($ => $.append("path")
          .attr('class', 'shape'))
        .post($ => $.attr("d", path))
    , data = call([])
  ;
  function shape(axes, context, ...args) {
    if (path.x) {
      path.x(scaler(axes.x().scale(), path.x()));
    }
    if (path.y) {
      path.y(scaler(axes.y().scale(), path.y()));
    }

    axes.apply(this, [context].concat(args));

    let shouldTransition = !!context.selection;
    let selection = shouldTransition ? context.selection() : context;
    selection = selection.select('.axes');

    let id = shape.id();
    let g = selection
      .select('g#' + id);
    if (g.empty()) {
      g = selection.append('g')
        .attr('id', id)
        .attr('class', 'shapes');
    }

    g = g.selectAll('path.shape')
    if (shouldTransition && g.transition) {
      g = g.transition(context);
    }
    g.call(data);
  }

  shape.path = function(_) {
    return arguments.length ? (path = _, this) : path;
  }

  shape.data = function(..._) {
    return arguments.length
      ? (data = call(..._), this)
      : (data.data ? data.data() : data);
  }

  shape.id = function(_) {
    return arguments.length ? (id = _, this) : (id || 'axes-shape-' + index);
  }

  shape.gup = function(_) {
    return arguments.length ? (call = _, this) : call;
  }

  return shape;
}

export function symbol(path) {
  let x = d => d[0]
    , y = d => d[1]
  ;

  path.x = function(_) {
    return arguments.length ? (x = _, this) : x;
  }

  path.y = function(_) {
    return arguments.length ? (y = _, this) : y;
  }

  let $ = shape(path);
  $.gup().post(
    compose(
      $ => $.attr('transform', d => `translate(${
        path.x()(d)
      } ${
        path.y()(d)
      })`)
    , $.gup().post()
    )
  );
  return $;
}
