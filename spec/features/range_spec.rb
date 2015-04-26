require 'spec_helper'
require 'selenium-webdriver'

Capybara.default_driver = :selenium
Capybara.ignore_hidden_elements = false

def url
  'http://localhost:8000'
end

feature 'RangeInput' do
  before(:each) do
    visit url
  end

  let(:range) { find '#range-1' }
  let(:point) { first '.point' }
  let(:tick) { first '.tick' }

  feature 'Smoke test' do
    scenario 'visit the page' do
      expect(page.title).to eq 'range'
    end
  end

  feature 'drag and drop' do
    scenario 'drag left' do
      value = range.value

      point.drag_to tick

      expect(range.value).to be < value
    end

    scenario 'drag right' do
      tickk = all('.tick').last
      value = range.value

      # TODO:drag n pixels instead
      point.drag_to tickk

      expect(range.value).to be > value
    end
  end

  feature 'keys' do
    scenario 'press right' do
      value = range.value
      point.click
      point.native.send_keys :arrow_right
      expect(range.value).to be > value
    end

    scenario 'press left' do
      value = range.value
      point.click
      point.native.send_keys :arrow_left
      expect(range.value).to be < value
    end

    scenario 'press up' do
      value = range.value
      point.click
      point.native.send_keys :arrow_up
      expect(range.value).to be > value
    end

    scenario 'press down' do
      value = range.value
      point.click
      point.native.send_keys :arrow_down
      expect(range.value).to be < value
    end

    scenario 'press tab' do
      replacement = first '.range-replacement'
      replacement.click
      replacement.native.send_keys :tab

      range2 = find('#range-2')
      focused = page.driver.browser.switch_to.active_element

      expect(focused).to eq range2.native
    end
  end

  feature 'click' do
    scenario 'click track changes value' do
      value = range.value
      tick.click

      expect(range.value).to_not be value
    end
  end

  feature 'events' do
    feature 'focus'
    feature 'blur'
    feature 'mousedown'
    feature 'mouseup'
    feature 'click'
    feature 'keydown'
    feature 'keyup'
  end

  feature 'max value' do
    # Init range with args, try to set > max
    scenario 'is 17'
  end

  feature 'min value' do
    # Init range with args, try to set < min
    scenario 'is 4'
  end

  feature 'step' do
    scenario 'is 3, min 0, max 12'
  end
end

