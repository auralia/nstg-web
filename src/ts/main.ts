/**
 * Copyright (C) 2017 Auralia
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import NsTgWebUi from "./ui";
// @formatter:off
import * as $ from "jquery";
// Hack to ensure bootstrap has access to jQuery
(window as any).$ = $;
(window as any).jQuery = $;
import "bootstrap";
// @formatter:on

new NsTgWebUi().init();
