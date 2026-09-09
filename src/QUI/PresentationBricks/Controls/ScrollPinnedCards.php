<?php

/**
 * This file contains QUI\PresentationBricks\Controls\ScrollPinnedCards
 */

namespace QUI\PresentationBricks\Controls;

use QUI;

/**
 * Class ScrollPinnedCards
 *
 * Section that pins itself while scrolling and moves large cards
 * horizontally, mapped 1:1 to the scroll progress inside a tall wrapper.
 *
 * The pin is a progressive enhancement: without JavaScript, on touch only
 * devices, on narrow viewports, with "prefers-reduced-motion" or with less
 * than two cards the very same markup renders as a plain stack of cards.
 *
 * Four of those five conditions are answered before any script runs - the
 * card count here, the three device conditions by the media query in the
 * stylesheet - so the pinned presentation is already part of the first paint
 * instead of replacing the stacked one. Only whether a card fits on the
 * screen needs a measurement, which leaves the frontend control with a veto.
 *
 * A card is built from areas: one or two text areas and an image area. Which
 * of them a card uses is decided by its layout, their inner spacing and
 * vertical alignment by the section settings, which every card may override.
 *
 * @package quiqqer/presentation-bricks
 */
class ScrollPinnedCards extends QUI\Control
{
    /**
     * Scroll length that is spent per card while the section is pinned.
     * A bigger value means the cards travel slower.
     */
    protected const SPEED_PRESETS = [
        'slow' => '110vh',
        'normal' => '75vh',
        'fast' => '45vh'
    ];

    protected const SPEEDS = ['slow', 'normal', 'fast'];

    protected const DEFAULT_SPEED = 'normal';

    /**
     * Width of the active (centered) card as a factor of --qui-page-contentSize.
     */
    protected const CARD_WIDTH_PRESETS = [
        '60' => '0.6',
        '65' => '0.65',
        '70' => '0.7',
        '75' => '0.75',
        '80' => '0.8',
        '85' => '0.85',
        '90' => '0.9',
        '95' => '0.95',
        '100' => '1'
    ];

    /**
     * The preset keys above are numeric strings and therefore stored as
     * integer array keys, so the allowed values are listed separately.
     */
    protected const CARD_WIDTHS = ['60', '65', '70', '75', '80', '85', '90', '95', '100'];

    protected const DEFAULT_CARD_WIDTH = '90';

    /**
     * Composition of a card. "text" is a single text area, "text-text" two of
     * them side by side, the remaining values combine a text area with the
     * image area.
     */
    protected const LAYOUTS = ['text', 'image', 'text-image', 'image-text', 'text-text'];

    protected const DEFAULT_LAYOUT = 'text';

    /**
     * Layouts that place two areas next to each other while the section is
     * pinned and therefore use the split ratio.
     */
    protected const SPLIT_LAYOUTS = ['text-image', 'image-text', 'text-text'];

    protected const SPLIT_RATIOS = ['50-50', '60-40', '40-60'];

    protected const COUNTER_MODES = ['inline', 'hidden', 'custom'];

    protected const DEFAULT_COUNTER_MODE = 'inline';

    /**
     * Button variants of the template design system, identical to the
     * "btnType" list of the Button / Buttons bricks in quiqqer/bricks.
     */
    protected const BUTTON_TYPES = [
        'primary',
        'primary-outline',
        'secondary',
        'secondary-outline',
        'success',
        'success-outline',
        'danger',
        'danger-outline',
        'warning',
        'warning-outline',
        'info',
        'info-outline',
        'dark',
        'dark-outline',
        'light',
        'light-outline',
        'white',
        'white-outline',
        'link',
        'link-body'
    ];

    protected const LINK_TARGETS = ['_self', '_blank'];

    protected const ICON_POSITIONS = ['start', 'end'];

    /**
     * Where the content of an area sits inside it. Only relevant while the
     * section is pinned: there every card is as tall as the tallest one, so a
     * short text - or an image with a limited height - has room left over.
     *
     * The editor facing values follow the vocabulary of the MultiLayout brick
     * in quiqqer/bricks, the mapped values are what CSS understands.
     *
     * @var array<string, string>
     */
    protected const VERTICAL_ALIGN_PRESETS = [
        'top' => 'start',
        'center' => 'center',
        'bottom' => 'end'
    ];

    protected const VERTICAL_ALIGNS = ['top', 'center', 'bottom'];

    protected const DEFAULT_CONTENT_VERTICAL_ALIGN = 'top';

    protected const DEFAULT_IMAGE_VERTICAL_ALIGN = 'center';

    /**
     * Vertical part of the object-position an image gets when it is not
     * cropped: with "contain" nothing is cut off, so the only question left
     * is where the letterboxed image sits inside its area.
     *
     * @var array<string, string>
     */
    protected const VERTICAL_ALIGN_OBJECT_POSITIONS = [
        'top' => 'center top',
        'center' => 'center center',
        'bottom' => 'center bottom'
    ];

    /**
     * Inner spacing of an area.
     *
     * The values grow with the width of the card (cqi - the card is a
     * container) but are capped by the viewport height as well: while the
     * section is pinned the padding is the first thing that may cost the
     * content its space, and a card that outgrows the pinned screen turns the
     * pin off completely.
     *
     * @var array<string, string>
     */
    protected const PADDING_PRESETS = [
        'none' => '0',
        'small' => 'clamp(0.5rem, min(2cqi, 2vh), 1.5rem)',
        'normal' => 'clamp(1rem, min(4cqi, 4vh), 3rem)',
        'large' => 'clamp(1.25rem, min(6cqi, 6vh), 4.5rem)',
        'extraLarge' => 'clamp(1.5rem, min(8cqi, 8vh), 6rem)'
    ];

    protected const PADDINGS = ['none', 'small', 'normal', 'large', 'extraLarge'];

    protected const DEFAULT_CONTENT_PADDING = 'normal';

    protected const DEFAULT_IMAGE_PADDING = 'none';

    /**
     * How the image fills its area. "cover" crops, "contain" shows the
     * complete motif and may leave empty space.
     */
    protected const IMAGE_FITS = ['cover', 'contain'];

    protected const DEFAULT_IMAGE_FIT = 'cover';

    protected const DEFAULT_IMAGE_CROP = 'center';

    /**
     * Which part of the image stays visible when it is cropped. Only used
     * together with "cover" - see buildImageObjectPosition().
     */
    protected const IMAGE_CROPS = [
        'left top',
        'top',
        'right top',
        'left',
        'center',
        'right',
        'left bottom',
        'bottom',
        'right bottom'
    ];

    /**
     * Button size classes of the template design system, identical to the
     * "size" setting of the Button / Buttons bricks in quiqqer/bricks.
     */
    protected const BUTTON_SIZES = [
        'default' => '',
        'sm' => 'btn-sm',
        'lg' => 'btn-lg'
    ];

    protected const BUTTON_SIZE_KEYS = ['default', 'sm', 'lg'];

    protected const DEFAULT_BUTTON_SIZE = 'default';

    /**
     * Data attribute names the control sets itself and that editor data must
     * not be able to overwrite.
     */
    protected const RESERVED_DATA_ATTRIBUTES = ['data-name', 'data-qui'];

    /**
     * Below this amount of cards the pin has nothing to travel, so the
     * stacked presentation is used instead.
     */
    protected const MIN_PIN_CARDS = 2;

    /**
     * Viewport width (px) from which the pin may become active. Matches the
     * desktop breakpoint of quiqqer/template-presentation.
     */
    protected const PIN_BREAKPOINT = 1024;

    /**
     * constructor
     *
     * @param array<string, mixed> $attributes
     */
    public function __construct(array $attributes = [])
    {
        $this->setAttributes([
            'class' => 'quiqqer-presentationBricks-scrollPinnedCards qui-content-grid',
            'nodeName' => 'section',
            'entries' => [],
            'cardWidth' => self::DEFAULT_CARD_WIDTH,
            'speed' => 'normal',
            'contentVerticalAlign' => self::DEFAULT_CONTENT_VERTICAL_ALIGN,
            'contentPadding' => self::DEFAULT_CONTENT_PADDING,
            'buttonsAligned' => false,
            'showNumbers' => true,
            'imageMaxHeight' => '',
            'imageFit' => self::DEFAULT_IMAGE_FIT,
            'imageCrop' => self::DEFAULT_IMAGE_CROP,
            'imageVerticalAlign' => self::DEFAULT_IMAGE_VERTICAL_ALIGN,
            'imagePadding' => self::DEFAULT_IMAGE_PADDING,
            'buttonSize' => self::DEFAULT_BUTTON_SIZE,
            'counterMode' => 'inline',
            'counterTarget' => ''
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(dirname(__FILE__) . '/ScrollPinnedCards.css');
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     *
     * @throws QUI\Exception
     */
    public function getBody(): string
    {
        $entries = $this->getEntries();

        if (empty($entries)) {
            QUI\System\Log::addWarning(
                'ScrollPinnedCards brick has no active cards, nothing rendered.',
                ['brickId' => $this->getAttribute('id')]
            );

            return '';
        }

        $cardWidth = $this->normalize('cardWidth', self::CARD_WIDTHS, self::DEFAULT_CARD_WIDTH);
        $speed = $this->normalize('speed', self::SPEEDS, self::DEFAULT_SPEED);
        $counterMode = $this->getCounterMode();
        $counterTarget = trim((string)$this->getAttribute('counterTarget'));

        $this->setCustomVariable('cardCount', (string)count($entries));
        $this->setCustomVariable('cardWidthFactor', self::CARD_WIDTH_PRESETS[$cardWidth]);
        $this->setCustomVariable('speed', self::SPEED_PRESETS[$speed]);

        // section wide area defaults; a card only overrides what it sets itself
        $this->setCustomVariable(
            'contentVerticalAlign',
            self::VERTICAL_ALIGN_PRESETS[$this->getSectionContentVerticalAlign()]
        );
        $this->setCustomVariable(
            'contentPadding',
            self::PADDING_PRESETS[$this->getSectionContentPadding()]
        );
        $this->setCustomVariable(
            'imageVerticalAlign',
            self::VERTICAL_ALIGN_PRESETS[$this->getSectionImageVerticalAlign()]
        );
        $this->setCustomVariable(
            'imagePadding',
            self::PADDING_PRESETS[$this->getSectionImagePadding()]
        );

        /*
         * "Buttons of all cards on one line" is a growing wrapper around the
         * text: it eats the free space of the card and pushes the button to
         * the lower edge. Switched off the wrapper keeps its content height
         * and the button stays directly below the text.
         */
        $this->setCustomVariable(
            'bodyGrow',
            $this->getAttribute('buttonsAligned') ? '1' : '0'
        );

        $this->setCustomVariable(
            'imageMaxHeight',
            $this->sanitizeCssLength((string)$this->getAttribute('imageMaxHeight'))
        );
        $this->setCustomVariable('imageFit', $this->getSectionImageFit());

        $this->setJavaScriptControl('package/quiqqer/presentation-bricks/bin/Controls/ScrollPinnedCards');
        $this->setJavaScriptControlOption('countermode', $counterMode);
        $this->setJavaScriptControlOption('countertarget', $counterMode === 'custom' ? $counterTarget : '');
        $this->setJavaScriptControlOption('breakpoint', self::PIN_BREAKPOINT);
        $this->setJavaScriptControlOption('mincards', self::MIN_PIN_CARDS);

        $Engine = QUI::getTemplateManager()->getEngine();

        $Engine->assign([
            'this' => $this,
            'cards' => $this->buildCards($entries),
            'showCounter' => $counterMode !== 'hidden',
            // the one pin condition the server can answer on its own; the
            // template turns it into the class the stylesheet gates on
            'mayPin' => count($entries) >= self::MIN_PIN_CARDS,
            'counterTotal' => $this->formatNumber(count($entries))
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/ScrollPinnedCards.html');
    }

    /**
     * Decoded, normalized and enabled entries in editor order.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function getEntries(): array
    {
        $entries = $this->getAttribute('entries');

        if (is_string($entries)) {
            $entries = json_decode($entries, true);
        }

        if (!is_array($entries)) {
            return [];
        }

        $result = [];

        foreach ($entries as $entry) {
            if (!is_array($entry)) {
                continue;
            }

            if (!empty($entry['disabled']) || !empty($entry['isDisabled'])) {
                continue;
            }

            $result[] = $this->normalizeEntry($entry);
        }

        return $result;
    }

    /**
     * Bring one stored entry into the shape the template expects. Values
     * coming from older or hand written data are normalized here as well,
     * the backend editor is not a trust boundary.
     *
     * An empty string in one of the override fields means "use the section
     * setting" - it is not a valid value of its own.
     *
     * @param array<string, mixed> $entry
     *
     * @return array<string, mixed>
     */
    protected function normalizeEntry(array $entry): array
    {
        $layout = (string)($entry['layout'] ?? self::DEFAULT_LAYOUT);
        $splitRatio = (string)($entry['splitRatio'] ?? '50-50');
        $btnType = (string)($entry['btnType'] ?? 'primary');
        $linkTarget = (string)($entry['linkTarget'] ?? '_self');
        $buttonIconPosition = (string)($entry['buttonIconPosition'] ?? 'start');
        $imageFit = (string)($entry['imageFit'] ?? '');
        $imageCrop = (string)($entry['imageCrop'] ?? '');
        $imageVerticalAlign = (string)($entry['imageVerticalAlign'] ?? '');
        $imagePadding = (string)($entry['imagePadding'] ?? '');
        $contentPrimaryPadding = (string)($entry['contentPrimaryPadding'] ?? '');
        $contentSecondaryPadding = (string)($entry['contentSecondaryPadding'] ?? '');

        return [
            'layout' => in_array($layout, self::LAYOUTS, true) ? $layout : self::DEFAULT_LAYOUT,
            'splitRatio' => in_array($splitRatio, self::SPLIT_RATIOS, true) ? $splitRatio : '50-50',
            'cardIcon' => trim((string)($entry['cardIcon'] ?? '')),
            'eyebrow' => trim((string)($entry['eyebrow'] ?? '')),
            'title' => trim((string)($entry['title'] ?? '')),
            'image' => trim((string)($entry['image'] ?? '')),
            'imageMaxHeight' => $this->sanitizeCssLength((string)($entry['imageMaxHeight'] ?? '')),
            'imageFit' => in_array($imageFit, self::IMAGE_FITS, true) ? $imageFit : '',
            'imageCrop' => in_array($imageCrop, self::IMAGE_CROPS, true) ? $imageCrop : '',
            'imageVerticalAlign' => in_array($imageVerticalAlign, self::VERTICAL_ALIGNS, true)
                ? $imageVerticalAlign
                : '',
            'imagePadding' => in_array($imagePadding, self::PADDINGS, true) ? $imagePadding : '',
            'contentPrimary' => (string)($entry['contentPrimary'] ?? ''),
            'contentSecondary' => (string)($entry['contentSecondary'] ?? ''),
            'contentPrimaryPadding' => in_array($contentPrimaryPadding, self::PADDINGS, true)
                ? $contentPrimaryPadding
                : '',
            'contentSecondaryPadding' => in_array($contentSecondaryPadding, self::PADDINGS, true)
                ? $contentSecondaryPadding
                : '',
            'buttonText' => trim((string)($entry['buttonText'] ?? '')),
            'btnType' => in_array($btnType, self::BUTTON_TYPES, true) ? $btnType : 'primary',
            'buttonIcon' => trim((string)($entry['buttonIcon'] ?? '')),
            'buttonIconPosition' => in_array($buttonIconPosition, self::ICON_POSITIONS, true)
                ? $buttonIconPosition
                : 'start',
            'buttonClass' => $this->normalizeCustomClass($entry['buttonClass'] ?? ''),
            'cardClass' => $this->normalizeCustomClass($entry['cardClass'] ?? ''),
            'buttonAriaLabel' => trim((string)($entry['buttonAriaLabel'] ?? '')),
            'buttonDataAttributes' => $this->normalizeDataAttributes($entry['buttonDataAttributes'] ?? []),
            'link' => $this->normalizeLink($entry['link'] ?? ''),
            'linkTarget' => in_array($linkTarget, self::LINK_TARGETS, true) ? $linkTarget : '_self',
            'linkNofollow' => !empty($entry['linkNofollow'])
        ];
    }

    /**
     * Turn the normalized entries into the view data of a single card.
     *
     * @param array<int, array<string, mixed>> $entries
     *
     * @return array<int, array<string, mixed>>
     */
    protected function buildCards(array $entries): array
    {
        $showNumbers = (bool)$this->getAttribute('showNumbers');
        $defaultButtonText = QUI::getLocale()->get(
            'quiqqer/presentation-bricks',
            'control.ScrollPinnedCards.button.default'
        );

        $cards = [];
        $position = 0;

        foreach ($entries as $entry) {
            $position++;

            $layout = (string)$entry['layout'];
            $isSplit = in_array($layout, self::SPLIT_LAYOUTS, true);
            $hasSecondary = $layout === 'text-text';
            $hasMedia = $entry['image'] !== ''
                && in_array($layout, ['image', 'text-image', 'image-text'], true);
            $hasText = $layout !== 'image';
            $hasLink = $entry['link'] !== '';
            $buttonText = $entry['buttonText'] !== '' ? $entry['buttonText'] : $defaultButtonText;

            $cards[] = [
                'layout' => $layout,
                'splitRatio' => $isSplit ? (string)$entry['splitRatio'] : '',
                'cardClass' => $entry['cardClass'],
                'number' => $this->formatNumber($position),
                'showNumber' => $showNumbers && $hasText,
                'hasMedia' => $hasMedia,
                'image' => $entry['image'],
                'cardStyle' => $this->buildCardStyle($entry),
                'mediaStyle' => $this->buildAreaStyle('--_imagePadding', (string)$entry['imagePadding']),
                'hasText' => $hasText,
                'primaryStyle' => $this->buildAreaStyle(
                    '--_contentPadding',
                    (string)$entry['contentPrimaryPadding']
                ),
                'hasSecondary' => $hasSecondary,
                'contentSecondary' => $entry['contentSecondary'],
                'secondaryStyle' => $this->buildAreaStyle(
                    '--_contentPadding',
                    (string)$entry['contentSecondaryPadding']
                ),
                'icon' => $entry['cardIcon'],
                'hasIcon' => $entry['cardIcon'] !== '',
                'iconIsImage' => QUI\Projects\Media\Utils::isMediaUrl($entry['cardIcon']),
                'eyebrow' => $entry['eyebrow'],
                'title' => $entry['title'],
                'content' => $entry['contentPrimary'],
                'hasButton' => $hasLink,
                'buttonText' => $buttonText,
                'buttonClass' => $this->buildButtonClass($entry),
                'buttonIcon' => $entry['buttonIcon'],
                'buttonIconPosition' => $entry['buttonIconPosition'],
                'buttonAriaLabel' => $entry['buttonAriaLabel'],
                'buttonDataAttributes' => $entry['buttonDataAttributes'],
                'link' => $entry['link'],
                'linkTarget' => $entry['linkTarget'],
                'linkRel' => $this->buildLinkRel($entry)
            ];
        }

        return $cards;
    }

    /**
     * Per card style: only the image options this card sets itself are
     * written as entry level CSS variables. Everything it leaves empty falls
     * through to the section wide setting in the stylesheet.
     *
     * The object position is the exception: it is always written, because it
     * is not a stored value but the result of fit, crop and alignment - see
     * buildImageObjectPosition().
     *
     * @param array<string, mixed> $entry
     */
    protected function buildCardStyle(array $entry): string
    {
        $declarations = ['--_q-entry-imageObjectPosition: ' . $this->buildImageObjectPosition($entry)];

        if ($entry['imageMaxHeight'] !== '') {
            $declarations[] = '--_q-entry-imageMaxHeight: ' . $entry['imageMaxHeight'];
        }

        if ($entry['imageFit'] !== '') {
            $declarations[] = '--_q-entry-imageFit: ' . $entry['imageFit'];
        }

        if ($entry['imageVerticalAlign'] !== '') {
            $declarations[] = '--_q-entry-imageVerticalAlign: '
                . self::VERTICAL_ALIGN_PRESETS[$entry['imageVerticalAlign']];
        }

        return htmlspecialchars(implode('; ', $declarations), ENT_QUOTES);
    }

    /**
     * Inner spacing of a single area, written directly onto the area element:
     * the two text areas of one card can differ, so the value cannot live on
     * the card. An empty override produces no declaration at all and the
     * area inherits the section setting from the card.
     */
    protected function buildAreaStyle(string $variable, string $padding): string
    {
        if ($padding === '' || !array_key_exists($padding, self::PADDING_PRESETS)) {
            return '';
        }

        return htmlspecialchars($variable . ': ' . self::PADDING_PRESETS[$padding], ENT_QUOTES);
    }

    /**
     * Vertical placement of the image inside its area.
     *
     * Both settings that could govern it own exactly one fit mode: with
     * "cover" the image is cut off, so the crop decides which part survives.
     * With "contain" nothing is cut off - the image is letterboxed inside the
     * area, and the only open question is whether it sits at the top, in the
     * middle or at the bottom, which is what the vertical alignment answers.
     *
     * @param array<string, mixed> $entry
     */
    protected function buildImageObjectPosition(array $entry): string
    {
        $fit = $entry['imageFit'] !== '' ? (string)$entry['imageFit'] : $this->getSectionImageFit();

        if ($fit === 'contain') {
            $align = $entry['imageVerticalAlign'] !== ''
                ? (string)$entry['imageVerticalAlign']
                : $this->getSectionImageVerticalAlign();

            return self::VERTICAL_ALIGN_OBJECT_POSITIONS[$align];
        }

        return $entry['imageCrop'] !== '' ? (string)$entry['imageCrop'] : $this->getSectionImageCrop();
    }

    protected function getSectionImageFit(): string
    {
        return $this->normalize('imageFit', self::IMAGE_FITS, self::DEFAULT_IMAGE_FIT);
    }

    protected function getSectionImageCrop(): string
    {
        return $this->normalize('imageCrop', self::IMAGE_CROPS, self::DEFAULT_IMAGE_CROP);
    }

    protected function getSectionImageVerticalAlign(): string
    {
        return $this->normalize(
            'imageVerticalAlign',
            self::VERTICAL_ALIGNS,
            self::DEFAULT_IMAGE_VERTICAL_ALIGN
        );
    }

    protected function getSectionContentVerticalAlign(): string
    {
        return $this->normalize(
            'contentVerticalAlign',
            self::VERTICAL_ALIGNS,
            self::DEFAULT_CONTENT_VERTICAL_ALIGN
        );
    }

    protected function getSectionContentPadding(): string
    {
        return $this->normalize('contentPadding', self::PADDINGS, self::DEFAULT_CONTENT_PADDING);
    }

    protected function getSectionImagePadding(): string
    {
        return $this->normalize('imagePadding', self::PADDINGS, self::DEFAULT_IMAGE_PADDING);
    }

    /**
     * Sanitize an editor entered CSS length. A bare number becomes pixels,
     * values with a unit (px, %, rem, ...) are kept, anything else returns an
     * empty string so the CSS fallback applies.
     */
    protected function sanitizeCssLength(string $value): string
    {
        $value = trim($value);

        if ($value === '') {
            return '';
        }

        if (preg_match('/^[0-9]+(?:\.[0-9]+)?[a-zA-Z%]*$/', $value) !== 1) {
            return '';
        }

        if (preg_match('/^[0-9]+(?:\.[0-9]+)?$/', $value) === 1) {
            return $value . 'px';
        }

        return $value;
    }

    /**
     * Full class attribute of the card button: the design system base class,
     * the colour variant, the global size and the editor's own classes.
     *
     * @param array<string, mixed> $entry
     */
    protected function buildButtonClass(array $entry): string
    {
        $size = $this->normalize('buttonSize', self::BUTTON_SIZE_KEYS, self::DEFAULT_BUTTON_SIZE);

        $classes = [
            'btn',
            'btn-' . $entry['btnType'],
            self::BUTTON_SIZES[$size],
            'quiqqer-presentationBricks-scrollPinnedCards__cardButton',
            (string)$entry['buttonClass']
        ];

        return implode(' ', array_filter($classes, static fn(string $class): bool => $class !== ''));
    }

    /**
     * Reduce the editor's custom class input to plain, space separated class
     * names so nothing can break out of the class attribute.
     *
     * @param mixed $customClass
     */
    protected function normalizeCustomClass(mixed $customClass): string
    {
        if (!is_string($customClass)) {
            return '';
        }

        $classes = preg_split('/\s+/', trim($customClass), -1, PREG_SPLIT_NO_EMPTY);
        $result = [];

        foreach ($classes ?: [] as $class) {
            if (preg_match('/^[A-Za-z_-][A-Za-z0-9_-]*$/', $class)) {
                $result[] = $class;
            }
        }

        return implode(' ', $result);
    }

    /**
     * Normalize the data attributes coming from the DataAttributes control:
     * a JSON list of {name, value} pairs. Only real data-* names pass, and the
     * attributes this control sets itself cannot be overwritten.
     *
     * @param mixed $dataAttributes
     *
     * @return array<int, array{name: string, value: string}>
     */
    protected function normalizeDataAttributes(mixed $dataAttributes): array
    {
        if (is_string($dataAttributes)) {
            $dataAttributes = json_decode($dataAttributes, true);
        }

        if (!is_array($dataAttributes)) {
            return [];
        }

        $result = [];

        foreach ($dataAttributes as $attribute) {
            if (!is_array($attribute)) {
                continue;
            }

            $name = strtolower(trim((string)($attribute['name'] ?? '')));
            $value = $attribute['value'] ?? '';

            if (!preg_match('/^data-[a-z0-9][a-z0-9_-]*$/', $name)) {
                continue;
            }

            if (in_array($name, self::RESERVED_DATA_ATTRIBUTES, true)) {
                continue;
            }

            if (!is_scalar($value) || is_bool($value)) {
                continue;
            }

            $result[] = [
                'name' => $name,
                'value' => (string)$value
            ];
        }

        return $result;
    }

    /**
     * Counter placement. A custom placement without a container name would
     * silently swallow the counter, so it falls back to the built in one.
     */
    protected function getCounterMode(): string
    {
        $mode = $this->normalize('counterMode', self::COUNTER_MODES, self::DEFAULT_COUNTER_MODE);

        if ($mode !== 'custom') {
            return $mode;
        }

        if (trim((string)$this->getAttribute('counterTarget')) !== '') {
            return 'custom';
        }

        QUI\System\Log::addWarning(
            'ScrollPinnedCards brick uses the custom counter position without a container name,'
            . ' falling back to the built in position.',
            ['brickId' => $this->getAttribute('id')]
        );

        return 'inline';
    }

    /**
     * Build the rel attribute of the card link. "noopener noreferrer" is
     * mandatory for a new tab, "nofollow" is an editor decision.
     *
     * @param array<string, mixed> $entry
     */
    protected function buildLinkRel(array $entry): string
    {
        $rel = [];

        if (!empty($entry['linkNofollow'])) {
            $rel[] = 'nofollow';
        }

        if ($entry['linkTarget'] === '_blank') {
            $rel[] = 'noopener';
            $rel[] = 'noreferrer';
        }

        return implode(' ', $rel);
    }

    /**
     * Accept an internal link (as stored by the site input) and http(s) URLs
     * only. Everything else - javascript:, data:, malformed values - becomes
     * an empty string, which removes the button and the card link.
     *
     * @param mixed $link
     */
    protected function normalizeLink(mixed $link): string
    {
        if (!is_string($link)) {
            return '';
        }

        $link = trim($link);

        if ($link === '' || preg_match('/[\x00-\x20\x7F]/', $link)) {
            return '';
        }

        $scheme = parse_url($link, PHP_URL_SCHEME);

        if ($scheme === false) {
            return '';
        }

        if ($scheme === null) {
            return $link;
        }

        if (!in_array(strtolower($scheme), ['http', 'https'], true)) {
            return '';
        }

        $host = parse_url($link, PHP_URL_HOST);

        if (!is_string($host) || $host === '') {
            return '';
        }

        return $link;
    }

    /**
     * Two digit card number: 1 becomes "01", 12 stays "12".
     */
    protected function formatNumber(int $number): string
    {
        return str_pad((string)$number, 2, '0', STR_PAD_LEFT);
    }

    /**
     * Return an attribute value only if it is part of the allowed list,
     * otherwise fall back to the given default.
     *
     * @param string $attribute
     * @param array<int, string> $allowed
     * @param string $default
     *
     * @return string
     */
    protected function normalize(string $attribute, array $allowed, string $default): string
    {
        $value = (string)$this->getAttribute($attribute);

        if (in_array($value, $allowed, true)) {
            return $value;
        }

        return $default;
    }

    /**
     * Write a control config CSS variable to the root element style. The CSS
     * picks it up via the long, themeable variable as a fallback layer.
     *
     * @param string $name
     * @param string $value
     *
     * @return void
     */
    private function setCustomVariable(string $name, string $value): void
    {
        if ($name === '' || $value === '') {
            return;
        }

        $this->setStyle('--_q-controlConf-' . $name, $value);
    }
}
