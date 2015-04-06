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

  let(:range) { first 'input[type=range]' }
  let(:point) { first '.point' }
  let(:tick) { first '.tick' }

  feature 'Smoke test' do
    scenario 'visit the page' do
      expect(page.title).to eq 'range'
    end
  end

  feature 'drag and drop' do
    scenario 'left' do
      value = range.value

      point.drag_to tick

      expect(range.value).to be < value
    end

    scenario 'right' do
      tickk = all('.tick').last
      value = range.value

      point.drag_to tickk

      expect(range.value).to be > value
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
    scenario 'is 17'
  end

  feature 'min value' do
    scenario 'is 4'
  end

  feature 'step' do
    scenario 'is 3, min 0, max 12'
  end
end

