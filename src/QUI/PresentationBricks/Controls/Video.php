<?php

/**
 * This file contains QUI\PresentationBricks\Controls\Video
 */

namespace QUI\PresentationBricks\Controls;

use QUI;

/**
 * Class Video
 *
 * @package quiqqer/presentation-bricks
 */
class Video extends QUI\Control
{
    /**
     * constructor
     *
     * @param array $attributes
     */
    public function __construct(array $attributes = [])
    {
        // default options
        $this->setAttributes([
            'class' => 'quiqqer-presentationBricks-video',
            'video' => false,
            'poster' => false,
            'shortVideo' => false,
            'autoplay' => true,
            'muted' => true,
            'loop' => true,
            'playsinline' => true,
            'playIfInView' => true,
            'videoButton' => 'showPermanent', // showPermanent, showOnMouseOver, disable
            'videoButtonAction' => 'playInWebsite', // playInWebsite, openInPopup
            'videoBrightness' => 50,
            'maxVideoWidth' => '',
            'maxContentWidth' => '',
        ]);

        parent::__construct($attributes);

        $this->setJavaScriptControl('package/quiqqer/presentation-bricks/bin/Controls/Video');

        $this->addCSSFile(
            dirname(__FILE__) . '/Video.css'
        );
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     */
    public function getBody(): string
    {
        $Engine = QUI::getTemplateManager()->getEngine();
        $autoplay = false;
        $muted = false;
        $loop = false;
        $playsinline = false;
        $videoBrightness = 50;

        $this->setJavaScriptControlOption('openinpopup', 0);

        if ($this->getAttribute('autoplay')) {
            $autoplay = $this->getAttribute('autoplay');
        }

        if ($this->getAttribute('muted')) {
            $muted = $this->getAttribute('muted');
        }

        if ($this->getAttribute('loop')) {
            $loop = $this->getAttribute('loop');
        }

        if ($this->getAttribute('playsinline')) {
            $playsinline = $this->getAttribute('playsinline');
        }

        $this->setJavaScriptControlOption('playifinview', $this->getAttribute('playIfInView'));

        if (
            intval($this->getAttribute('videoBrightness')) &&
            intval($this->getAttribute('videoBrightness')) > 0 &&
            intval($this->getAttribute('videoBrightness')) <= 100
        ) {
            $videoBrightness = intval($this->getAttribute('videoBrightness'));
        }


        /**
         * poster url
         */
        $posterUrl = false;

        try {
            $Poster = QUI\Projects\Media\Utils::getImageByUrl($this->getAttribute('poster'));
            $posterUrl = $Poster->getUrl(true);
        } catch (QUI\Exception) {
            // nothing
        }

        $videoBrightness = $videoBrightness / 100;

        if ($this->getAttribute('videoButtonAction') === 'openInPopup') {
            $this->setJavaScriptControlOption('openinpopup', 1);

            if ($posterUrl) {
                $this->setJavaScriptControlOption('poster', $posterUrl);
            }

            try {
                $Video = QUI\Projects\Media\Utils::getMediaItemByUrl($this->getAttribute('video'));
                $this->setJavaScriptControlOption('video', $Video->getUrl(true));
            } catch (QUI\Exception) {
                // nothing
            }
        }

        if ($this->getAttribute('videoButton') === 'showOnMouseOver') {
            $this->addCSSClass('quiqqer-presentationBricks-video__showBtnOnMouseOver');
        }

        $this->setStyles([
            '--qui-video-videoBrightness' => $videoBrightness,
            '--qui-video-maxVideoWidth' => $this->checkMaxWidth($this->getAttribute('maxVideoWidth')),
            '--qui-video-maxContentWidth' => $this->checkMaxWidth($this->getAttribute('maxContentWidth')),
        ]);

        $Engine->assign([
            'this' => $this,
            'posterUrl' => $posterUrl,
            'autoplay' => $autoplay,
            'muted' => $muted,
            'loop' => $loop,
            'playsinline' => $playsinline,
            'buttonFile' => dirname(__FILE__) . '/Video.button.html'
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/Video.default.html');
    }

    /**
     * Check max width and return correct value
     *
     * @param $value
     * @return string
     */
    protected function checkMaxWidth($value): string
    {
        $width = 'initial';

        if (
            !$value ||
            intval($value) <= 0
        ) {
            return $width;
        }

        return intval($value) . 'px';
    }
}
