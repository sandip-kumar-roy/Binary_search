window.console = window.console || function(t) {};

if (document.location.search.match(/type=embed/gi)) {
  window.parent.postMessage("resize", "*");
}





(function bsApp() {

    /*********** Binary Search ************/

    function binarySearch(search, arr) {

        let low = 0;
        let high = arr.length - 1;

        while (low <= high) {
            let mid = low + Math.floor((high - low) / 2);

            if (search === arr[low]) return low;
            else if (search === arr[mid]) return mid;
            else if (search === arr[high]) return high;
            else if (search > arr[mid]) low = mid + 1;
            else if (search < arr[mid]) high = mid - 1;

        }
        return -1;
    }

    /********************************************/
    let search;
    let arr = [];
    for (let i = 0; i < 30; i++) arr.push(i * i);

    class UICell {

        constructor(value) {
            this.$el = document.createElement('li');
            this.$el.classList.add('cell');
            this.$el.textContent = value;
            this.type = {low: false, mid: false, high: false, target: false};
        }

        ensureMarkerList() {
            let $markerList = this.$el.querySelector('ul');
            if (!$markerList) {
                $markerList = document.createElement('ul');
                this.$el.appendChild($markerList);
            }
            return $markerList;
        }

        createMarker(label) {

            let $markerList = this.ensureMarkerList();

            let $marker = document.createElement('li');
            $marker.classList.add('step-marker');
            $marker.textContent = label;
            $marker.classList.add(`step-marker__${label.toLowerCase()}`);
            $markerList.appendChild($marker);
        }

        markAsLow() {
            if (!this.type.low) {
                this.type.low = true;
                this.$el.classList.add('low-cell');
                this.createMarker('Low');
            }
            return this;
        }

        markAsMid() {
            if (!this.type.mid) {
                this.type.mid = true;
                this.$el.classList.add('mid-cell');
                this.createMarker('Mid');
            }
            return this;
        }

        markAsHigh() {
            if (!this.type.high) {
                this.type.high = true;
                this.$el.classList.add('high-cell');
                this.createMarker('High');
            }
            return this;
        }

        markAsTarget() {
            if (!this.type.target) {
                this.type.target = true;
                this.$el.classList.add('target-cell');
                this.createMarker('Target');
            }
            return this;
        }

        reject() {
            this.clear();
            this.$el.classList.add('reject');
        }

        clear(...args) {
            if (args.length && typeof args[0] === 'string') {
                let key = args[0];
                let $markers = this.$el.querySelector('ul');
                if ($markers) {
                    let $target = $markers.querySelector(`.step-marker__${key}`);
                    $target && $markers.removeChild($target);
                    this.$el.classList.remove(`${key}-cell`);
                }
                this.type[key] = false;
            }
        }

    }

    class UI {

        constructor(params) {

            // DOM
            this.$list = document.querySelector('.list');
            this.$next = document.querySelector('.next');
            this.$history = document.querySelector('.history-list');
            this.$title = document.querySelector('.title');
            
            this.$title.textContent = 'Binary Search. Please select a target';
            
            // state
            this.$cells = [];
            this.$markers = {low: null, mid: null, high: null, target: null};
            this.$historyItems = [];
            this.started = false;
            this.tO = [];

            // Events
            this.$next.classList.add('hide');
            this.$next.addEventListener('click', () => {
                this.$next.textContent === 'Next Step' ? params.onNext() : params.onReset()
            });

            this.$list.addEventListener('click', e => {
                if (!this.started) {
                    let target = e.target;
                    if (target.classList.contains('cell')) {
                        let idx = this.$cells.findIndex(cell => cell.$el === target);
                        this.setTarget(idx);
                    }
                }
            })
        }

        reset() {

            this.tO.forEach( to => clearTimeout(to));
            this.tO = [];

            this.started = false;
            this.$list.classList.remove('started');
            this.$list.innerHTML = '';
            this.$history.innerHTML = '';
            this.$cells = [];
            this.$markers = {low: null, mid: null, high: null, target: null};
            this.$historyItems = [];
            this.$next.textContent = 'Next Step';
            this.$next.classList.add('hide');
            this.$title.textContent = 'Binary Search. Please select a target';
        }

        renderArray() {
            let frag = document.createDocumentFragment();
            for (let i = 0; i < arr.length; i++) {
                let cell = new UICell(arr[i]);
                this.$cells.push(cell);
                frag.appendChild(cell.$el);
            }
            this.$list.innerHTML = '';
            this.$list.appendChild(frag);
        }

        updateCells(step, rejections = []) {

            let $nextLow = this.$cells[step.low];
            let $nextMid = this.$cells[step.mid];
            let $nextHi = this.$cells[step.high];

            if (this.$markers.low && this.$markers.low !== $nextLow) {
                this.$markers.low.clear('low');
            }

            if (this.$markers.mid && this.$markers.mid !== $nextLow) {
                this.$markers.mid.clear('mid');
            }

            if (this.$markers.high && this.$markers.high !== $nextLow) {
                this.$markers.high.clear('high');
            }

            this.$markers.low = $nextLow.markAsLow();
            this.$markers.mid = $nextMid.markAsMid();
            this.$markers.high = $nextHi.markAsHigh();

            if (rejections.length) {
                if (Array.isArray(rejections[0])) {
                    this.toggleRangeOfCells(rejections[0][0], rejections[0][1]);
                    this.toggleRangeOfCells(rejections[1][0], rejections[1][1]);
                } else {
                    this.toggleRangeOfCells(rejections[0], rejections[1]);
                }
            }

        }

        toggleCellRejection(cellIdx, nth = 0) {
            this.tO.push(setTimeout(() => {
                    this.$cells[cellIdx].reject()
            }, nth * 10));
        }

        toggleRangeOfCells(from, to) {
            let nth = 0;
            if (from < to) {
                for (let i = from; i <= to; i++) this.toggleCellRejection(i, nth++);
            } else if (from > to) {
                for (let i = from; i >= to; i--) this.toggleCellRejection(i, nth++);
            } else {
                this.toggleCellRejection(from, 1);
            }
        }

        setTarget(idx) {
            search = arr[idx];
            this.$markers.target && this.$markers.target.clear('target');
            this.$markers.target = this.$cells[idx].markAsTarget();
            this.$next.classList.remove('hide');
            this.$title.textContent = `Binary Search, looking for ${search}`;
        }

        addHistory(step) {

            let node = UI.historyTpl.cloneNode(true);

            node.querySelector('.history__low').textContent = arr[step.low];
            node.querySelector('.history__mid').textContent = arr[step.mid];
            node.querySelector('.history__high').textContent = arr[step.high];

            this.$historyItems.push(node);
            this.$history.appendChild(node);
        }

        updateControls(steps) {

            if (steps.n > 1) {
                this.started = true;
                this.$list.classList.add('started');
            }

            if (steps.peek().done) {
                this.$next.textContent = 'Reset';
                this.$title.textContent = `Binary Search, found ${search} in ${steps.n} steps!`;

            }
        }
    }
    UI.historyTpl = document.querySelector('.history-item');


    class Stack {

        constructor() {
            this.first = null;
            this.n = 0;
        }

        push(data) {
            this.first = {data: data, next: this.first};
            this.n++;
        }

        peek() {
            return this.first ? this.first.data : null;
        }
    }


    const terminations = {
        RUNNING: 0,
        NOT_FOUND: 1,
        LOW: 2,
        MID: 3,
        HI: 4
    };

    class Illustration {

        constructor() {

            this.ui = new UI({
                onNext: () => this.forward(),
                onReset: () => this.reset(),
            });

            this.cut = new Stack();
            this.steps = new Stack();

            this.low = 0;
            this.high = arr.length - 1;
            this.termination = terminations.RUNNING;
        }

        init() {
            this.ui.renderArray();
            this.ui.updateCells(this._computeStep());
        }

        get mid() {
            return this.low + Math.floor((this.high - this.low) / 2);
        }

        _computeStep() {

            let step = {low: this.low, high: this.high, mid: this.mid};
            let prevStep = this.steps.peek();

            // When termination
            if (prevStep) {

                let rejections = [];

                if (this.termination) {
                    switch (this.termination) {

                        case terminations.LOW:
                            rejections = step.low === 0 ?
                                [step.low + 1, prevStep.high] :
                                [[prevStep.low, step.low - 1], [step.low + 1, prevStep.high]];
                            break;
                        case terminations.MID:
                            rejections = [[prevStep.low, step.mid - 1], [step.mid + 1, prevStep.high]];
                            break;
                        case terminations.HI:
                            rejections = step.high === arr.length - 1 ?
                                [prevStep.low, step.high - 1] :
                                [[prevStep.low, step.high - 1], [step.high + 1, prevStep.high]];
                            break;
                    }
                }
                else if (prevStep.high > step.high) {
                    rejections = [prevStep.mid, prevStep.high];
                } else if (prevStep.low < step.low) {
                    rejections = [prevStep.low, prevStep.mid];
                }

                this.cut.push(rejections);
            }

            this.termination && (step.done = true);
            this.steps.push(step);
            this.ui.addHistory(step);
            return step;
        }

        buildNextStep() {

            if (!this.termination) {

                if (this.low > this.high) {
                    this.termination = terminations.NOT_FOUND;
                    return null;
                }

                let mid = this.mid;

                if (search > arr[mid]) {
                    this.low = mid + 1;
                } else if (search < arr[mid]) {
                    this.high = mid - 1;
                }

                if (search === arr[this.low]) {
                    this.termination = terminations.LOW;
                } else if (search === arr[this.mid]) {
                    this.termination = terminations.MID;
                } else if (search === arr[this.high]) {
                    this.termination = terminations.HI;
                }

                return this._computeStep(this.steps.peek());
            }

            return null
        }

        forward() {
            let step = this.buildNextStep();
            if (step) {
                this.ui.updateCells(step, this.cut.peek());
                this.ui.updateControls(this.steps);
            }
        }

        reset() {

            this.ui.reset();

            search = null;
            this.cut = new Stack();
            this.steps = new Stack();
            this.low = 0;
            this.high = arr.length - 1;
            this.termination = terminations.RUNNING;
            this.init();
        }
    }

    let illustration = new Illustration();
    illustration.init();
})();








