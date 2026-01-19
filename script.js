function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (event) {
      var targetId = this.getAttribute("href").substring(1);
      if (!targetId) {
        return;
      }
      var target = document.getElementById(targetId);
      if (!target) {
        return;
      }
      event.preventDefault();
      window.scrollTo({
        top: target.offsetTop - 72,
        behavior: "smooth"
      });
    });
  });
}

function setupCodeTabs() {
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".code-tab"));
  var blocks = Array.prototype.slice.call(document.querySelectorAll(".code-block"));

  if (!tabs.length) {
    return;
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var lang = tab.getAttribute("data-lang");
      tabs.forEach(function (t) {
        t.classList.toggle("active", t === tab);
      });
      blocks.forEach(function (block) {
        block.classList.toggle("active", block.getAttribute("data-lang") === lang);
      });
    });
  });
}

function computeBlurScoreFromImage(image, canvas, threshold, update) {
  var maxWidth = 480;
  var width = image.naturalWidth;
  var height = image.naturalHeight;

  if (!width || !height) {
    return;
  }

  if (width > maxWidth) {
    var scale = maxWidth / width;
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  canvas.width = width;
  canvas.height = height;

  var ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  ctx.drawImage(image, 0, 0, width, height);
  var imageData = ctx.getImageData(0, 0, width, height);
  var data = imageData.data;

  var gray = new Float32Array(width * height);
  for (var i = 0; i < data.length; i += 4) {
    var r = data[i];
    var g = data[i + 1];
    var b = data[i + 2];
    gray[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  var laplacian = new Float32Array(width * height);
  var kernel = [0, 1, 0, 1, -4, 1, 0, 1, 0];

  for (var y = 1; y < height - 1; y++) {
    for (var x = 1; x < width - 1; x++) {
      var sum = 0;
      var idx = y * width + x;
      var k = 0;

      for (var ky = -1; ky <= 1; ky++) {
        for (var kx = -1; kx <= 1; kx++) {
          var px = x + kx;
          var py = y + ky;
          sum += gray[py * width + px] * kernel[k++];
        }
      }

      laplacian[idx] = sum;
    }
  }

  var count = 0;
  var mean = 0;

  for (var j = 0; j < laplacian.length; j++) {
    var value = laplacian[j];
    if (!value && value !== 0) {
      continue;
    }
    count += 1;
    mean += value;
  }

  if (!count) {
    return;
  }

  mean /= count;

  var variance = 0;
  for (var m = 0; m < laplacian.length; m++) {
    var v = laplacian[m];
    if (!v && v !== 0) {
      continue;
    }
    var diff = v - mean;
    variance += diff * diff;
  }

  variance /= count;

  var score = Math.sqrt(variance);
  var isBlurry = score < threshold;

  update(score, isBlurry);
}

function formatScore(score) {
  if (!score && score !== 0) {
    return "–";
  }
  if (score === 0) {
    return "0.0";
  }
  if (score < 10) {
    return score.toFixed(2);
  }
  return score.toFixed(1);
}

function setupDemo() {
  var threshold = 40;
  var lastScore = null;

  var fileInput = document.getElementById("file-input");
  var heroInput = document.getElementById("hero-file-input");
  var previewCanvas = document.getElementById("preview-canvas");
  var previewPlaceholder = document.getElementById("preview-placeholder");
  var metricLabel = document.getElementById("metric-label");
  var metricScore = document.getElementById("metric-score");
  var metricThreshold = document.getElementById("metric-threshold");
  var heroResult = document.getElementById("hero-result");
  var heroScore = document.getElementById("hero-score");
  var thresholdSlider = document.getElementById("threshold-slider");
  var thresholdValue = document.getElementById("threshold-value");

  if (thresholdSlider) {
    var sliderValue = Number(thresholdSlider.value);
    if (sliderValue) {
      threshold = sliderValue;
    }
  }

  metricThreshold.textContent = threshold.toFixed(1);
  if (thresholdValue) {
    thresholdValue.textContent = String(Math.round(threshold));
  }

  if (!fileInput || !previewCanvas || !previewPlaceholder) {
    return;
  }

  function updateOutputs(score, isBlurry) {
    lastScore = score;
    var label = isBlurry ? "Blurry" : "Not blurry";
    metricLabel.textContent = label;
    metricScore.textContent = formatScore(score);

    if (heroResult && heroScore) {
      var heroLabel = isBlurry ? "Blurry" : "Not blurry";
      heroResult.querySelector(".hero-result-label").textContent = "Live classification (local)";
      heroScore.textContent = heroLabel + " (" + formatScore(score) + ")";
    }
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    var url = URL.createObjectURL(file);
    var image = new Image();
    image.onload = function () {
      previewPlaceholder.classList.add("hidden");
      computeBlurScoreFromImage(image, previewCanvas, threshold, updateOutputs);
      URL.revokeObjectURL(url);
    };
    image.src = url;
  }

  fileInput.addEventListener("change", function (event) {
    var file = event.target.files && event.target.files[0];
    handleFile(file);
  });

  if (heroInput) {
    heroInput.addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      handleFile(file);
    });
  }

  if (thresholdSlider) {
    thresholdSlider.addEventListener("input", function (event) {
      var value = Number(event.target.value);
      if (!value && value !== 0) {
        return;
      }
      threshold = value;
      metricThreshold.textContent = threshold.toFixed(1);
      if (thresholdValue) {
        thresholdValue.textContent = String(Math.round(threshold));
      }
      if (lastScore || lastScore === 0) {
        var blurry = lastScore < threshold;
        updateOutputs(lastScore, blurry);
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  setupSmoothScroll();
  setupCodeTabs();
  setupDemo();
});
